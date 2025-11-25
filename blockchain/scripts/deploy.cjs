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
 */

const hre = require("hardhat");

async function main() {
  const { ethers, network } = hre;
  
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════
  
  const CEO_COLD_WALLET = process.env.CEO_COLD_WALLET || "0x0000000000000000000000000000000000000001";
  const SELENE_HOT_WALLET = process.env.SELENE_HOT_WALLET || "0x0000000000000000000000000000000000000002";
  
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🦷 DENTIA ECOSYSTEM - DEPLOYMENT STARTING");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`📍 Network: ${network.name}`);
  console.log(`👔 CEO Cold Wallet: ${CEO_COLD_WALLET}`);
  console.log(`🤖 Selene Hot Wallet: ${SELENE_HOT_WALLET}`);
  console.log("═══════════════════════════════════════════════════════════════\n");
  
  // Validate addresses
  if (CEO_COLD_WALLET.startsWith("0x000000000000000000000000000000000000000")) {
    console.error("❌ ERROR: CEO_COLD_WALLET not configured!");
    console.error("   Set it in your .env file or environment variables");
    process.exit(1);
  }
  
  if (SELENE_HOT_WALLET.startsWith("0x000000000000000000000000000000000000000")) {
    console.error("❌ ERROR: SELENE_HOT_WALLET not configured!");
    console.error("   Set it in your .env file or environment variables");
    process.exit(1);
  }
  
  const [deployer] = await ethers.getSigners();
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  
  console.log(`🔑 Deployer: ${deployer.address}`);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(deployerBalance)} ETH\n`);
  
  if (deployerBalance < ethers.parseEther("0.01")) {
    console.error("❌ ERROR: Insufficient ETH for deployment!");
    console.error("   Get testnet ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }
  
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
  
  // Check if deployer has admin role
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
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
  
  console.log("📋 CONTRACT ADDRESSES (Copy these to your .env):");
  console.log(`   DENTIA_COIN_ADDRESS=${tokenAddress}`);
  console.log(`   DENTIA_REWARDS_ADDRESS=${rewardsAddress}\n`);
  
  console.log("🔐 ROLE ASSIGNMENTS:");
  console.log(`   DEFAULT_ADMIN_ROLE: ${CEO_COLD_WALLET}`);
  console.log(`   PAUSER_ROLE:        ${CEO_COLD_WALLET}`);
  console.log(`   GUARDIAN_ROLE:      ${CEO_COLD_WALLET}`);
  console.log(`   OPERATOR_ROLE:      ${SELENE_HOT_WALLET}\n`);
  
  console.log("📊 TOKEN STATS:");
  const treasuryBalance = await dentiaCoin.balanceOf(rewardsAddress);
  console.log(`   Total Supply:     100,000,000 DENTIA`);
  console.log(`   Treasury Balance: ${ethers.formatEther(treasuryBalance)} DENTIA\n`);
  
  // Verification commands
  console.log("🔍 VERIFICATION COMMANDS:");
  console.log(`   npx hardhat verify --network ${network.name} ${tokenAddress} "${rewardsAddress}" "${CEO_COLD_WALLET}"`);
  console.log(`   npx hardhat verify --network ${network.name} ${rewardsAddress} "${CEO_COLD_WALLET}"\n`);
  
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("✅ Deployment successful! Update your .env with the addresses above.");
  console.log("═══════════════════════════════════════════════════════════════");
  
  return {
    dentiaCoin: tokenAddress,
    dentiaRewards: rewardsAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
