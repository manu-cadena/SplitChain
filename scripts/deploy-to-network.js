const { ethers, network } = require('hardhat');
const fs = require('fs');

async function main() {
  // Get information about the network we're deploying to
  console.log(`Deploying to ${network.name} network...`);

  // Get the signers
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(
    `Account balance: ${ethers.formatEther(
      await deployer.provider.getBalance(deployer.address)
    )} ETH`
  );

  // Deploy SplitChainFactory
  console.log('\nDeploying SplitChainFactory...');
  const SplitChainFactory = await ethers.getContractFactory(
    'SplitChainFactory'
  );
  const splitChainFactory = await SplitChainFactory.deploy();
  await splitChainFactory.waitForDeployment();

  const splitChainFactoryAddress = await splitChainFactory.getAddress();
  console.log(`SplitChainFactory deployed to: ${splitChainFactoryAddress}`);

  // Store deployment info for frontend use
  const deploymentInfo = {
    network: network.name,
    factoryAddress: splitChainFactoryAddress,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
  };

  // Save deployment information to a file
  saveDeploymentInfo(deploymentInfo);

  console.log('\nDeployment completed successfully!');
}

function saveDeploymentInfo(deploymentInfo) {
  // Create deployments directory if it doesn't exist
  const dir = './deployments';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save deployment info to a file specific to the network
  const filename = `${dir}/${deploymentInfo.network}-deployment.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\nDeployment information saved to ${filename}`);

  // Also update or create .env.local file for frontend
  const envContent = `REACT_APP_NETWORK=${deploymentInfo.network}
REACT_APP_FACTORY_ADDRESS=${deploymentInfo.factoryAddress}
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('Environment variables updated in .env.local');
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
