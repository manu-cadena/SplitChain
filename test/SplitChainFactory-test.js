const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SplitChainFactory', function () {
  let splitChainFactory;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const SplitChainFactory = await ethers.getContractFactory(
      'SplitChainFactory'
    );
    splitChainFactory = await SplitChainFactory.deploy();
    await splitChainFactory.waitForDeployment();
  });

  it('Should return an empty array of expense groups initially', async function () {
    const groups = await splitChainFactory.getAllExpenseGroups();
    expect(groups.length).to.equal(0);
  });
});
