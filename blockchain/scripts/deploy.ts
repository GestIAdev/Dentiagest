/**
 * 🚀 DENTIA ECOSYSTEM DEPLOYMENT SCRIPT
 * ═══════════════════════════════════════════════════════════════
 * 
 * DEPLOYMENT ORDER:
 * 1. Deploy DentiaRewards (Treasury) - gets its address
 * 2. Deploy DentiaCoin with treasury address - mints 100M to treasury
 * 3. Configure DentiaRewards with token address
 * 4. Grant OPERATOR_ROLE to Selene hot wallet
 * 5. Verify contracts on block explorer
 * 
 * SECURITY CHECKLIST:
 * ✅ CEO cold wallet receives DEFAULT_ADMIN_ROLE
 * ✅ Selene hot wallet receives OPERATOR_ROLE
 * ✅ Token address is set once (immutable after)
 * ✅ All tokens start in treasury
 */

import pkg from "hardhat";
const { ethers, network } = pkg;

async function main() {
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION - MODIFY THESE FOR YOUR DEPLOYMENT
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * CEO_COLD_WALLET: 
   * - Hardware wallet (Ledger/Trezor)
   * - Receives DEFAULT_ADMIN_ROLE on both contracts
   * - Should NEVER be online except for critical operations
   * - Recommended: Gnosis Safe multisig with 2/3 threshold
   */
  const CEO_COLD_WALLET = process.env.CEO_COLD_WALLET || "0x...REPLACE_WITH_CEO_ADDRESS";
  
  /**
   * SELENE_HOT_WALLET:
   * - Server-side wallet managed by Selene Core
   * - Receives OPERATOR_ROLE on DentiaRewards
   * - Used for automated reward distribution
   * - Should have limited funds (only gas)
   */
  const SELENE_HOT_WALLET = process.env.SELENE_HOT_WALLET || "0x...REPLACE_WITH_SELENE_ADDRESS";
  
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🦷 DENTIA ECOSYSTEM - DEPLOYMENT STARTING");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`📍 Network: ${network.name}`);
  console.log(`👔 CEO Cold Wallet: ${CEO_COLD_WALLET}`);
  console.log(`🤖 Selene Hot Wallet: ${SELENE_HOT_WALLET}`);
  console.log("═══════════════════════════════════════════════════════════════\n");
  
  const [deployer] = await ethers.getSigners();
  console.log(`🔑 Deployer: ${deployer.address}`);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Deploy DentiaRewards (Treasury)
  // ═══════════════════════════════════════════════════════════════
  
  console.log("📦 STEP 1: Deploying DentiaRewards (Treasury)...");
  
  const DentiaRewards = await ethers.getContractFactory("DentiaRewards");
  const dentiaRewards = await DentiaRewards.deploy(CEO_COLD_WALLET);
  await dentiaRewards.waitForDeployment();
  
  const rewardsAddress = await dentiaRewards.getAddress();
  console.log(`✅ DentiaRewards deployed at: ${rewardsAddress}\n`);
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Deploy DentiaCoin (Token)
  // ═══════════════════════════════════════════════════════════════
  
  console.log("📦 STEP 2: Deploying DentiaCoin ($DENTIA)...");
  
  const DentiaCoin = await ethers.getContractFactory("DentiaCoin");
  const dentiaCoin = await DentiaCoin.deploy(
    rewardsAddress,      // Treasury receives all 100M tokens
    CEO_COLD_WALLET      // CEO gets admin role
  );
  await dentiaCoin.waitForDeployment();
  
  const tokenAddress = await dentiaCoin.getAddress();
  console.log(`✅ DentiaCoin deployed at: ${tokenAddress}`);
  console.log(`💰 MAX_SUPPLY: 100,000,000 DENTIA minted to treasury\n`);
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Configure DentiaRewards with Token Address
  // ═══════════════════════════════════════════════════════════════
  
  console.log("⚙️ STEP 3: Configuring DentiaRewards with token address...");
  
  // Note: This must be done by CEO_COLD_WALLET if deployer is different
  // For initial deployment, we assume deployer has admin temporarily
  // In production: CEO does this step manually
  
  /**
   * IMPORTANT: If deployer != CEO_COLD_WALLET:
   * This transaction must be signed by CEO_COLD_WALLET
   * 
   * In production flow:
   * 1. Deployer deploys both contracts
   * 2. CEO signs setTokenAddress() from cold wallet
   * 3. CEO grants OPERATOR_ROLE to Selene
   * 4. Deployer renounces any temporary roles
   */
  
  // Check if deployer has admin role (for test/dev environments)
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash; // 0x00...00
  const hasAdminRole = await dentiaRewards.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  
  if (hasAdminRole) {
    const setTokenTx = await dentiaRewards.setTokenAddress(tokenAddress);
    await setTokenTx.wait();
    console.log(`✅ Token address configured on DentiaRewards\n`);
  } else {
    console.log(`⚠️ Deployer doesn't have admin role. CEO must call setTokenAddress().`);
    console.log(`   Transaction data: dentiaRewards.setTokenAddress("${tokenAddress}")\n`);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Grant OPERATOR_ROLE to Selene
  // ═══════════════════════════════════════════════════════════════
  
  console.log("🔐 STEP 4: Granting OPERATOR_ROLE to Selene hot wallet...");
  
  const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
  
  if (hasAdminRole) {
    const grantRoleTx = await dentiaRewards.grantRole(OPERATOR_ROLE, SELENE_HOT_WALLET);
    await grantRoleTx.wait();
    console.log(`✅ OPERATOR_ROLE granted to: ${SELENE_HOT_WALLET}\n`);
  } else {
    console.log(`⚠️ Deployer doesn't have admin role. CEO must grant OPERATOR_ROLE.`);
    console.log(`   Transaction data: dentiaRewards.grantRole("${OPERATOR_ROLE}", "${SELENE_HOT_WALLET}")\n`);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // VERIFICATION DATA
  // ═══════════════════════════════════════════════════════════════
  
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("═══════════════════════════════════════════════════════════════\n");
  
  console.log("📋 CONTRACT ADDRESSES:");
  console.log(`   DentiaCoin:    ${tokenAddress}`);
  console.log(`   DentiaRewards: ${rewardsAddress}\n`);
  
  console.log("🔐 ROLE ASSIGNMENTS:");
  console.log(`   DEFAULT_ADMIN_ROLE: ${CEO_COLD_WALLET}`);
  console.log(`   PAUSER_ROLE:        ${CEO_COLD_WALLET}`);
  console.log(`   GUARDIAN_ROLE:      ${CEO_COLD_WALLET}`);
  console.log(`   OPERATOR_ROLE:      ${SELENE_HOT_WALLET}\n`);
  
  console.log("📊 TOKEN STATS:");
  const treasuryBalance = await dentiaCoin.balanceOf(rewardsAddress);
  console.log(`   Total Supply:     100,000,000 DENTIA`);
  console.log(`   Treasury Balance: ${ethers.formatEther(treasuryBalance)} DENTIA\n`);
  
  // ═══════════════════════════════════════════════════════════════
  // VERIFICATION COMMANDS (for Etherscan/Polygonscan)
  // ═══════════════════════════════════════════════════════════════
  
  console.log("🔍 VERIFICATION COMMANDS:");
  console.log(`   npx hardhat verify --network ${network.name} ${tokenAddress} "${rewardsAddress}" "${CEO_COLD_WALLET}"`);
  console.log(`   npx hardhat verify --network ${network.name} ${rewardsAddress} "${CEO_COLD_WALLET}"\n`);
  
  // Return deployment info for scripts/tests
  return {
    dentiaCoin: tokenAddress,
    dentiaRewards: rewardsAddress,
    ceoWallet: CEO_COLD_WALLET,
    seleneWallet: SELENE_HOT_WALLET,
  };
}

// Execute deployment
main()
  .then((result) => {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("✅ Deployment successful!");
    console.log("═══════════════════════════════════════════════════════════════");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
