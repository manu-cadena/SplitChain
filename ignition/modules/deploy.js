const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying SplitChain contracts...');

  // Deploy SplitChainFactory
  const SplitChainFactory = await ethers.getContractFactory(
    'SplitChainFactory'
  );
  const splitChainFactory = await SplitChainFactory.deploy();
  await splitChainFactory.waitForDeployment();

  const splitChainFactoryAddress = await splitChainFactory.getAddress();
  console.log(`SplitChainFactory deployed to: ${splitChainFactoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
