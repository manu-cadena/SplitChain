const { run, network } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log(`Verifying contracts on ${network.name} network...`);

  // Load deployment info
  const deploymentInfo = loadDeploymentInfo(network.name);

  if (!deploymentInfo) {
    console.error(`No deployment found for ${network.name} network.`);
    return;
  }

  // Verify Factory contract
  console.log(
    `Verifying SplitChainFactory at ${deploymentInfo.factoryAddress}...`
  );
  try {
    await run('verify:verify', {
      address: deploymentInfo.factoryAddress,
      constructorArguments: [],
    });
    console.log('SplitChainFactory verification successful!');
  } catch (error) {
    console.error('Error verifying SplitChainFactory:', error.message);
  }

  // Note: For ExpenseGroup contracts, we would need their addresses and constructor args
  // Since they're created by the factory, you'd need to extract them from events or logs
}

function loadDeploymentInfo(networkName) {
  const filename = `./deployments/${networkName}-deployment.json`;

  if (!fs.existsSync(filename)) {
    return null;
  }

  const rawData = fs.readFileSync(filename);
  return JSON.parse(rawData);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
