// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DentiaRewards (Treasury/Dispatcher)
 * @author PunkClaude x GestIA Dev
 * @notice Gestiona la distribución de recompensas $DENTIA desde Selene Core
 * @dev Intermediario entre Backend centralizado y Blockchain
 * 
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎁 DENTIA REWARDS - Treasury & Dispatcher                       ║
 * ║  Selene valida FIAT → Triggers blockchain rewards                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Patient pays FIAT → Selene validates → rewardPatient() called  │
 * │  DentiaRewards transfers $DENTIA from treasury to patient       │
 * │  VitalPass Frontend listens to RewardDistributed event          │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * SECURITY MODEL:
 * - ReentrancyGuard: Prevents reentrancy attacks on reward distribution
 * - AccessControl: RBAC for operators (Selene hot wallets)
 * - Rate Limiting: Per-patient daily limits to prevent abuse
 * - Nonce system: Prevents replay attacks from compromised backends
 * 
 * ROLES:
 * - DEFAULT_ADMIN_ROLE: CEO Cold Wallet (God mode)
 * - OPERATOR_ROLE: Selene hot wallet (can distribute rewards)
 * - GUARDIAN_ROLE: Can pause in emergency (optional secondary admin)
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DentiaRewards is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ═══════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Role for Selene backend operators
     * @dev These wallets can call rewardPatient()
     */
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    /**
     * @notice Role for emergency guardians
     * @dev Can pause but not configure the contract
     */
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    
    /**
     * @notice Maximum reward per single transaction (100,000 DENTIA)
     * @dev Prevents catastrophic errors or compromised operator abuse
     */
    uint256 public constant MAX_REWARD_PER_TX = 100_000 * 10**18;
    
    /**
     * @notice Maximum daily reward per patient (10,000 DENTIA)
     * @dev Anti-abuse: No patient can receive more than this per day
     */
    uint256 public constant MAX_DAILY_REWARD_PER_PATIENT = 10_000 * 10**18;
    
    /**
     * @notice Cooldown period for rate limiting (24 hours)
     */
    uint256 public constant RATE_LIMIT_PERIOD = 24 hours;
    
    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice The $DENTIA token contract
     * @dev Set via setTokenAddress() after both contracts are deployed
     */
    IERC20 public dentiaToken;
    
    /**
     * @notice Total rewards distributed since deployment
     */
    uint256 public totalDistributed;
    
    /**
     * @notice Total unique patients who received rewards
     */
    uint256 public totalPatients;
    
    /**
     * @notice Tracks used nonces to prevent replay attacks
     * @dev nonces[operatorAddress][nonce] = used
     */
    mapping(address => mapping(uint256 => bool)) public usedNonces;
    
    /**
     * @notice Rate limiting: tracks daily rewards per patient
     * @dev rateLimits[patientAddress].amount = tokens received today
     *      rateLimits[patientAddress].resetTime = when to reset counter
     */
    struct RateLimit {
        uint256 amount;
        uint256 resetTime;
    }
    mapping(address => RateLimit) public rateLimits;
    
    /**
     * @notice Tracks if a patient has ever received rewards
     * @dev Used for totalPatients counter
     */
    mapping(address => bool) public hasReceivedRewards;
    
    /**
     * @notice Timestamp of contract deployment
     */
    uint256 public immutable deploymentTimestamp;
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Emitted when rewards are distributed to a patient
     * @param patient Recipient wallet address
     * @param amount Amount of $DENTIA transferred
     * @param operatorNonce Unique nonce from Selene for idempotency
     * @param operator Address of the Selene operator wallet
     * @param reason Human-readable reason (e.g., "PAYMENT_COMPLETED_INV123")
     */
    event RewardDistributed(
        address indexed patient,
        uint256 amount,
        uint256 indexed operatorNonce,
        address indexed operator,
        string reason
    );
    
    /**
     * @notice Emitted when token address is configured
     * @param tokenAddress Address of the DentiaCoin contract
     * @param configuredBy Admin who configured it
     */
    event TokenConfigured(
        address indexed tokenAddress,
        address indexed configuredBy
    );
    
    /**
     * @notice Emitted when emergency pause is triggered
     * @param by Address that triggered pause
     * @param reason Human-readable reason
     */
    event EmergencyPause(address indexed by, string reason);
    
    /**
     * @notice Emitted when contract is unpaused
     * @param by Address that triggered unpause
     */
    event EmergencyUnpause(address indexed by);
    
    /**
     * @notice Emitted when treasury withdraws tokens (emergency only)
     * @param to Recipient address
     * @param amount Amount withdrawn
     * @param by Admin who triggered withdrawal
     */
    event EmergencyWithdrawal(
        address indexed to,
        uint256 amount,
        address indexed by
    );
    
    // ═══════════════════════════════════════════════════════════════
    // ERRORS (Custom errors for gas efficiency)
    // ═══════════════════════════════════════════════════════════════
    
    /// @notice Token address not yet configured
    error TokenNotConfigured();
    
    /// @notice Token address already configured (immutable after first set)
    error TokenAlreadyConfigured();
    
    /// @notice Token address cannot be zero
    error ZeroTokenAddress();
    
    /// @notice Patient address cannot be zero
    error ZeroPatientAddress();
    
    /// @notice Reward amount cannot be zero
    error ZeroRewardAmount();
    
    /// @notice Reward exceeds per-transaction maximum
    error RewardExceedsMaxPerTx(uint256 requested, uint256 maximum);
    
    /// @notice Patient exceeded daily rate limit
    error DailyRateLimitExceeded(uint256 requested, uint256 remaining);
    
    /// @notice Nonce already used (replay attack prevention)
    error NonceAlreadyUsed(uint256 nonce);
    
    /// @notice Insufficient treasury balance
    error InsufficientTreasuryBalance(uint256 requested, uint256 available);
    
    /// @notice Admin address cannot be zero
    error ZeroAdminAddress();
    
    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Deploys the DentiaRewards treasury contract
     * @param _admin Address of CEO cold wallet (DEFAULT_ADMIN_ROLE)
     * 
     * @dev Token address is set separately via setTokenAddress()
     * This allows for: Deploy Rewards → Deploy Token → Configure both
     */
    constructor(address _admin) {
        if (_admin == address(0)) revert ZeroAdminAddress();
        
        deploymentTimestamp = block.timestamp;
        
        // Setup access control
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GUARDIAN_ROLE, _admin);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Sets the $DENTIA token address (one-time only)
     * @param _tokenAddress Address of deployed DentiaCoin contract
     * 
     * @dev Can only be called once - prevents admin from swapping tokens
     * Security: After this, token address is effectively immutable
     */
    function setTokenAddress(
        address _tokenAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(dentiaToken) != address(0)) revert TokenAlreadyConfigured();
        if (_tokenAddress == address(0)) revert ZeroTokenAddress();
        
        dentiaToken = IERC20(_tokenAddress);
        
        emit TokenConfigured(_tokenAddress, msg.sender);
    }
    
    /**
     * @notice Emergency pause - stops all reward distributions
     * @param reason Human-readable reason for the pause
     */
    function emergencyPause(
        string calldata reason
    ) external onlyRole(GUARDIAN_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }
    
    /**
     * @notice Unpause the contract
     */
    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }
    
    /**
     * @notice Emergency withdrawal of treasury tokens
     * @param to Recipient address
     * @param amount Amount to withdraw
     * 
     * @dev Only DEFAULT_ADMIN_ROLE can call this
     * Use case: Contract upgrade, security incident
     */
    function emergencyWithdraw(
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (address(dentiaToken) == address(0)) revert TokenNotConfigured();
        
        dentiaToken.safeTransfer(to, amount);
        
        emit EmergencyWithdrawal(to, amount, msg.sender);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // OPERATOR FUNCTIONS (Selene Backend)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Distributes $DENTIA rewards to a patient
     * @param patientWallet Address of the patient's wallet
     * @param amount Amount of $DENTIA to transfer
     * @param nonce Unique nonce from Selene (prevents replay attacks)
     * @param reason Human-readable reason (for event logging)
     * 
     * @dev Security layers:
     * 1. Only OPERATOR_ROLE can call
     * 2. Contract must not be paused
     * 3. ReentrancyGuard prevents reentrancy
     * 4. Nonce prevents replay attacks
     * 5. Rate limiting per patient
     * 6. Per-transaction maximum
     * 
     * @dev Called by Selene after validating FIAT payment:
     * ```
     * await dentiaRewards.rewardPatient(
     *   patientWallet,
     *   ethers.parseEther("100"),
     *   Date.now(), // nonce
     *   "PAYMENT_COMPLETED_INV-2025-001"
     * );
     * ```
     */
    function rewardPatient(
        address patientWallet,
        uint256 amount,
        uint256 nonce,
        string calldata reason
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused nonReentrant {
        // ═══════════════════════════════════════════════════════════
        // CHECKS
        // ═══════════════════════════════════════════════════════════
        
        // Validate token configured
        if (address(dentiaToken) == address(0)) revert TokenNotConfigured();
        
        // Validate inputs
        if (patientWallet == address(0)) revert ZeroPatientAddress();
        if (amount == 0) revert ZeroRewardAmount();
        
        // Check per-transaction limit
        if (amount > MAX_REWARD_PER_TX) {
            revert RewardExceedsMaxPerTx(amount, MAX_REWARD_PER_TX);
        }
        
        // Check nonce not already used (replay attack prevention)
        if (usedNonces[msg.sender][nonce]) {
            revert NonceAlreadyUsed(nonce);
        }
        
        // Check rate limiting
        RateLimit storage limit = rateLimits[patientWallet];
        if (block.timestamp >= limit.resetTime) {
            // Reset the counter for new period
            limit.amount = 0;
            limit.resetTime = block.timestamp + RATE_LIMIT_PERIOD;
        }
        
        uint256 remaining = MAX_DAILY_REWARD_PER_PATIENT - limit.amount;
        if (amount > remaining) {
            revert DailyRateLimitExceeded(amount, remaining);
        }
        
        // Check treasury balance
        uint256 treasuryBalance = dentiaToken.balanceOf(address(this));
        if (amount > treasuryBalance) {
            revert InsufficientTreasuryBalance(amount, treasuryBalance);
        }
        
        // ═══════════════════════════════════════════════════════════
        // EFFECTS (Update state before external calls)
        // ═══════════════════════════════════════════════════════════
        
        // Mark nonce as used
        usedNonces[msg.sender][nonce] = true;
        
        // Update rate limit
        limit.amount += amount;
        
        // Update statistics
        totalDistributed += amount;
        
        // Track unique patients
        if (!hasReceivedRewards[patientWallet]) {
            hasReceivedRewards[patientWallet] = true;
            totalPatients++;
        }
        
        // ═══════════════════════════════════════════════════════════
        // INTERACTIONS (External calls last - CEI pattern)
        // ═══════════════════════════════════════════════════════════
        
        // Transfer tokens to patient
        dentiaToken.safeTransfer(patientWallet, amount);
        
        // Emit event for VitalPass frontend
        emit RewardDistributed(
            patientWallet,
            amount,
            nonce,
            msg.sender,
            reason
        );
    }
    
    /**
     * @notice Batch distribute rewards to multiple patients
     * @param patients Array of patient wallet addresses
     * @param amounts Array of reward amounts
     * @param nonces Array of unique nonces
     * @param reasons Array of reasons
     * 
     * @dev Gas-efficient batch operation for end-of-day settlements
     * Arrays must be same length
     */
    function batchRewardPatients(
        address[] calldata patients,
        uint256[] calldata amounts,
        uint256[] calldata nonces,
        string[] calldata reasons
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused nonReentrant {
        uint256 length = patients.length;
        require(
            length == amounts.length && 
            length == nonces.length && 
            length == reasons.length,
            "Array length mismatch"
        );
        require(length <= 50, "Batch too large"); // Gas limit safety
        
        for (uint256 i = 0; i < length; i++) {
            _rewardPatientInternal(
                patients[i],
                amounts[i],
                nonces[i],
                reasons[i]
            );
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Internal reward logic (shared by single and batch)
     * @dev Does NOT have reentrancy guard - caller must provide it
     */
    function _rewardPatientInternal(
        address patientWallet,
        uint256 amount,
        uint256 nonce,
        string calldata reason
    ) internal {
        // Validate token configured
        if (address(dentiaToken) == address(0)) revert TokenNotConfigured();
        
        // Validate inputs
        if (patientWallet == address(0)) revert ZeroPatientAddress();
        if (amount == 0) revert ZeroRewardAmount();
        
        // Check per-transaction limit
        if (amount > MAX_REWARD_PER_TX) {
            revert RewardExceedsMaxPerTx(amount, MAX_REWARD_PER_TX);
        }
        
        // Check nonce
        if (usedNonces[msg.sender][nonce]) {
            revert NonceAlreadyUsed(nonce);
        }
        
        // Rate limiting
        RateLimit storage limit = rateLimits[patientWallet];
        if (block.timestamp >= limit.resetTime) {
            limit.amount = 0;
            limit.resetTime = block.timestamp + RATE_LIMIT_PERIOD;
        }
        
        uint256 remaining = MAX_DAILY_REWARD_PER_PATIENT - limit.amount;
        if (amount > remaining) {
            revert DailyRateLimitExceeded(amount, remaining);
        }
        
        // Effects
        usedNonces[msg.sender][nonce] = true;
        limit.amount += amount;
        totalDistributed += amount;
        
        if (!hasReceivedRewards[patientWallet]) {
            hasReceivedRewards[patientWallet] = true;
            totalPatients++;
        }
        
        // Interactions
        dentiaToken.safeTransfer(patientWallet, amount);
        
        emit RewardDistributed(patientWallet, amount, nonce, msg.sender, reason);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Returns current treasury balance
     * @return Available $DENTIA for rewards
     */
    function treasuryBalance() external view returns (uint256) {
        if (address(dentiaToken) == address(0)) return 0;
        return dentiaToken.balanceOf(address(this));
    }
    
    /**
     * @notice Returns remaining daily allowance for a patient
     * @param patient Patient wallet address
     * @return remainingAllowance Tokens patient can still receive today
     * @return resetTime Timestamp when allowance resets
     */
    function getRemainingDailyAllowance(
        address patient
    ) external view returns (uint256 remainingAllowance, uint256 resetTime) {
        RateLimit memory limit = rateLimits[patient];
        
        if (block.timestamp >= limit.resetTime) {
            // Would reset on next interaction
            return (MAX_DAILY_REWARD_PER_PATIENT, block.timestamp + RATE_LIMIT_PERIOD);
        }
        
        return (MAX_DAILY_REWARD_PER_PATIENT - limit.amount, limit.resetTime);
    }
    
    /**
     * @notice Checks if a nonce has been used by an operator
     * @param operator Operator wallet address
     * @param nonce Nonce to check
     * @return True if nonce was already used
     */
    function isNonceUsed(
        address operator,
        uint256 nonce
    ) external view returns (bool) {
        return usedNonces[operator][nonce];
    }
    
    /**
     * @notice Returns contract statistics
     * @return _totalDistributed Total tokens distributed
     * @return _totalPatients Unique patients count
     * @return _treasuryBalance Current treasury balance
     */
    function getStatistics() external view returns (
        uint256 _totalDistributed,
        uint256 _totalPatients,
        uint256 _treasuryBalance
    ) {
        return (
            totalDistributed,
            totalPatients,
            address(dentiaToken) != address(0) 
                ? dentiaToken.balanceOf(address(this)) 
                : 0
        );
    }
}
