const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying SplitChain contracts...');

  // Get the signers
  const [deployer, addr1, addr2] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Deploy SplitChainFactory
  console.log('Deploying SplitChainFactory...');
  const SplitChainFactory = await ethers.getContractFactory(
    'SplitChainFactory'
  );
  const splitChainFactory = await SplitChainFactory.deploy();
  await splitChainFactory.waitForDeployment();

  const splitChainFactoryAddress = await splitChainFactory.getAddress();
  console.log(`SplitChainFactory deployed to: ${splitChainFactoryAddress}`);

  // Create a sample expense group
  console.log('Creating a sample expense group...');

  const tx = await splitChainFactory.createExpenseGroup(
    'Trip to Paris',
    'Expenses for our vacation',
    [deployer.address, addr1.address, addr2.address]
  );

  const receipt = await tx.wait();
  console.log(`Transaction hash: ${receipt.hash}`);

  // Get the sample group address
  const userGroups = await splitChainFactory.getUserCreatedGroups(
    deployer.address
  );
  const expenseGroupAddress = userGroups[0];
  console.log(`Sample expense group created at: ${expenseGroupAddress}`);

  // Add a sample expense to the group
  console.log('Adding a sample expense...');

  // Get the ExpenseGroup contract instance
  const ExpenseGroup = await ethers.getContractFactory('ExpenseGroup');
  const expenseGroup = ExpenseGroup.attach(expenseGroupAddress);

  // Add an expense (for example: Hotel booking paid by the deployer, split among all members)
  const expenseTx = await expenseGroup.addExpense(
    'Hotel Booking',
    '3 nights at Grand Hotel',
    'Accommodation',
    ethers.parseEther('1'), // 1 ETH
    [addr1.address, addr2.address], // Split between addr1 and addr2
    '' // No receipt hash for now
  );

  const expenseReceipt = await expenseTx.wait();
  console.log(`Expense added. Transaction hash: ${expenseReceipt.hash}`);

  // Get balances to verify
  const deployerBalance = await expenseGroup.getMemberBalance(deployer.address);
  const addr1Balance = await expenseGroup.getMemberBalance(addr1.address);
  const addr2Balance = await expenseGroup.getMemberBalance(addr2.address);

  console.log(`\nBalances after expense:`);
  console.log(`Deployer: ${ethers.formatEther(deployerBalance)} ETH`);
  console.log(`Member 1: ${ethers.formatEther(addr1Balance)} ETH`);
  console.log(`Member 2: ${ethers.formatEther(addr2Balance)} ETH`);

  // Output contract addresses for frontend integration
  console.log('\nContract Addresses for Frontend Integration:');
  console.log(`REACT_APP_FACTORY_ADDRESS=${splitChainFactoryAddress}`);
  console.log(`REACT_APP_SAMPLE_GROUP_ADDRESS=${expenseGroupAddress}`);

  console.log('\nDeployment completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
