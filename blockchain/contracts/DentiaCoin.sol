// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DentiaCoin ($DENTIA)
 * @author PunkClaude x GestIA Dev
 * @notice Token de fidelización para el ecosistema VitalPass/Dentiagest
 * @dev ERC-20 con supply limitado, quemable, pausable y control de acceso RBAC
 * 
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🦷 DENTIA TOKEN - Economic Singularity Protocol                 ║
 * ║  Trust but Verify. Código limpio, modular y seguro.              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * SECURITY MODEL:
 * - MAX_SUPPLY: 100,000,000 tokens (hard cap - NO INFLATION)
 * - All tokens minted at deployment to Treasury (DentiaRewards)
 * - Patients burn tokens to redeem services
 * - Emergency pause mechanism (CEO cold wallet)
 * 
 * ROLES:
 * - DEFAULT_ADMIN_ROLE: CEO Cold Wallet (God mode)
 * - PAUSER_ROLE: Emergency pause capability
 * - No MINTER_ROLE needed - supply is fixed at deployment
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DentiaCoin is ERC20, ERC20Burnable, ERC20Pausable, AccessControl {
    
    // ═══════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Maximum supply of DENTIA tokens (100 million with 18 decimals)
     * @dev This is a HARD CAP - no tokens can be minted beyond this
     */
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    /**
     * @notice Role identifier for accounts that can pause/unpause the contract
     * @dev Assigned to CEO cold wallet and optionally emergency multisig
     */
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Address of the Treasury/Rewards contract
     * @dev Set at deployment, receives all initial tokens
     */
    address public immutable treasury;
    
    /**
     * @notice Timestamp of contract deployment
     * @dev Useful for analytics and time-based logic
     */
    uint256 public immutable deploymentTimestamp;
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Emitted when tokens are burned for service redemption
     * @param patient Address of the patient burning tokens
     * @param amount Amount of tokens burned
     * @param serviceId Off-chain service identifier (for Selene correlation)
     */
    event TokensBurnedForService(
        address indexed patient,
        uint256 amount,
        bytes32 indexed serviceId
    );
    
    /**
     * @notice Emitted when contract is emergency paused
     * @param by Address that triggered the pause
     * @param reason Human-readable reason (optional)
     */
    event EmergencyPause(address indexed by, string reason);
    
    /**
     * @notice Emitted when contract is unpaused
     * @param by Address that triggered the unpause
     */
    event EmergencyUnpause(address indexed by);
    
    // ═══════════════════════════════════════════════════════════════
    // ERRORS (Custom errors for gas efficiency)
    // ═══════════════════════════════════════════════════════════════
    
    /// @notice Treasury address cannot be zero
    error ZeroTreasuryAddress();
    
    /// @notice Admin address cannot be zero
    error ZeroAdminAddress();
    
    /// @notice Service ID cannot be empty
    error EmptyServiceId();
    
    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Deploys the DentiaCoin token with full supply to treasury
     * @param _treasury Address of the DentiaRewards contract (receives all tokens)
     * @param _admin Address of the CEO cold wallet (DEFAULT_ADMIN_ROLE)
     * 
     * @dev Deployment Order:
     * 1. Deploy DentiaRewards first (get address)
     * 2. Deploy DentiaCoin with treasury = DentiaRewards address
     * 3. DentiaRewards.setTokenAddress(DentiaCoin)
     */
    constructor(
        address _treasury,
        address _admin
    ) ERC20("DentiaCoin", "DENTIA") {
        // ═══════════════════════════════════════════════════════════
        // SECURITY: Validate inputs
        // ═══════════════════════════════════════════════════════════
        if (_treasury == address(0)) revert ZeroTreasuryAddress();
        if (_admin == address(0)) revert ZeroAdminAddress();
        
        // ═══════════════════════════════════════════════════════════
        // STATE: Set immutables
        // ═══════════════════════════════════════════════════════════
        treasury = _treasury;
        deploymentTimestamp = block.timestamp;
        
        // ═══════════════════════════════════════════════════════════
        // ACCESS CONTROL: Setup roles
        // ═══════════════════════════════════════════════════════════
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        
        // ═══════════════════════════════════════════════════════════
        // MINTING: All tokens to treasury (FIXED SUPPLY)
        // ═══════════════════════════════════════════════════════════
        _mint(_treasury, MAX_SUPPLY);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // EXTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Burns tokens to redeem a dental service
     * @param amount Amount of tokens to burn
     * @param serviceId Off-chain service identifier from Selene
     * 
     * @dev This function:
     * 1. Burns tokens from msg.sender
     * 2. Emits event for Selene to process the redemption
     * 
     * Security: No reentrancy risk - burn happens before event
     */
    function burnForService(
        uint256 amount,
        bytes32 serviceId
    ) external whenNotPaused {
        if (serviceId == bytes32(0)) revert EmptyServiceId();
        
        // Effects before interactions (CEI pattern)
        _burn(msg.sender, amount);
        
        emit TokensBurnedForService(msg.sender, amount, serviceId);
    }
    
    /**
     * @notice Emergency pause - stops all transfers
     * @param reason Human-readable reason for the pause
     * 
     * @dev Only accounts with PAUSER_ROLE can call this
     * Use cases: Security breach, contract upgrade, market manipulation
     */
    function emergencyPause(string calldata reason) external onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }
    
    /**
     * @notice Unpause the contract
     * @dev Only accounts with PAUSER_ROLE can call this
     */
    function emergencyUnpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Returns the circulating supply (total - treasury balance)
     * @return Tokens held by patients and clinics (not in treasury)
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply() - balanceOf(treasury);
    }
    
    /**
     * @notice Returns the burned supply (MAX_SUPPLY - totalSupply)
     * @return Total tokens that have been burned
     */
    function burnedSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // OVERRIDES (Required by Solidity for multiple inheritance)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @dev Hook that is called before any transfer of tokens
     * @param from Sender address
     * @param to Recipient address
     * @param value Amount of tokens
     * 
     * Security: Combines Pausable check with standard transfer logic
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
    
    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
