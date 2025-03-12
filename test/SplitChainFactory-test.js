const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SplitChain Contracts', function () {
  let splitChainFactory;
  let owner, addr1, addr2, addr3;
  let expenseGroupAddress;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy the factory contract
    const SplitChainFactory = await ethers.getContractFactory(
      'SplitChainFactory'
    );
    splitChainFactory = await SplitChainFactory.deploy();
    await splitChainFactory.waitForDeployment();
  });

  describe('SplitChainFactory', function () {
    it('Should return an empty array of expense groups initially', async function () {
      const groups = await splitChainFactory.getAllExpenseGroups();
      expect(groups.length).to.equal(0);
    });

    it('Should create a new expense group', async function () {
      // Create a new expense group
      const createTx = await splitChainFactory.createExpenseGroup(
        'Trip to Paris',
        'Vacation expenses',
        [owner.address, addr1.address, addr2.address]
      );
      await createTx.wait();

      // Get all expense groups
      const groups = await splitChainFactory.getAllExpenseGroups();
      expect(groups.length).to.equal(1);

      // Save the group address for later tests
      expenseGroupAddress = groups[0];
    });

    it('Should track user groups correctly', async function () {
      // Create a group with specific members
      const createTx = await splitChainFactory.createExpenseGroup(
        'Weekend Trip',
        'Short trip expenses',
        [owner.address, addr1.address]
      );
      await createTx.wait();

      // Check user's created groups
      const createdGroups = await splitChainFactory.getUserCreatedGroups(
        owner.address
      );
      expect(createdGroups.length).to.equal(1);

      // Check user's membership groups
      const ownerGroups = await splitChainFactory.getUserGroups(owner.address);
      const addr1Groups = await splitChainFactory.getUserGroups(addr1.address);
      const addr2Groups = await splitChainFactory.getUserGroups(addr2.address);

      expect(ownerGroups.length).to.equal(1);
      expect(addr1Groups.length).to.equal(1);
      expect(addr2Groups.length).to.equal(0); // addr2 is not a member
    });
  });

  describe('ExpenseGroup', function () {
    let expenseGroup;

    beforeEach(async function () {
      // Create a new expense group for testing
      const createTx = await splitChainFactory.createExpenseGroup(
        'Test Group',
        'Testing expense group functionality',
        [owner.address, addr1.address, addr2.address]
      );
      await createTx.wait();

      // Get the created group address
      const groups = await splitChainFactory.getAllExpenseGroups();
      expenseGroupAddress = groups[groups.length - 1];

      // Get the ExpenseGroup contract instance
      const ExpenseGroup = await ethers.getContractFactory('ExpenseGroup');
      expenseGroup = ExpenseGroup.attach(expenseGroupAddress);
    });

    it('Should initialize with correct values', async function () {
      expect(await expenseGroup.name()).to.equal('Test Group');
      expect(await expenseGroup.description()).to.equal(
        'Testing expense group functionality'
      );
      expect(await expenseGroup.creator()).to.equal(owner.address);
      expect(await expenseGroup.isActive()).to.equal(true);

      // Check members
      const members = await expenseGroup.getAllMembers();
      expect(members.length).to.equal(3);
      expect(members).to.include(owner.address);
      expect(members).to.include(addr1.address);
      expect(members).to.include(addr2.address);
    });

    it('Should allow adding expenses', async function () {
      // Add an expense
      const addExpenseTx = await expenseGroup.addExpense(
        'Dinner',
        'Restaurant dinner',
        'Food',
        ethers.parseEther('1'), // 1 ETH
        [addr1.address, addr2.address], // Split between addr1 and addr2
        '' // No receipt
      );
      await addExpenseTx.wait();

      // Check expenses
      const expenses = await expenseGroup.getAllExpenses();
      expect(expenses.length).to.equal(1);

      // Check balances
      const ownerBalance = await expenseGroup.getMemberBalance(owner.address);
      const addr1Balance = await expenseGroup.getMemberBalance(addr1.address);
      const addr2Balance = await expenseGroup.getMemberBalance(addr2.address);

      // Owner paid 1 ETH and is owed that amount
      expect(ownerBalance).to.equal(ethers.parseEther('1'));

      // addr1 and addr2 each owe 0.5 ETH (split equally)
      expect(addr1Balance).to.equal(ethers.parseEther('-0.5'));
      expect(addr2Balance).to.equal(ethers.parseEther('-0.5'));
    });

    it('Should allow adding and removing members', async function () {
      // Add a new member
      await expenseGroup.addMember(addr3.address);

      // Check members
      let members = await expenseGroup.getAllMembers();
      expect(members.length).to.equal(4);
      expect(members).to.include(addr3.address);

      // Remove a member
      await expenseGroup.removeMember(addr3.address);

      // Check members again
      members = await expenseGroup.getAllMembers();
      expect(members.length).to.equal(3);
      expect(members).to.not.include(addr3.address);
    });
  });
});
