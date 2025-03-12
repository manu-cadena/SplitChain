# SplitChain Smart Contracts

This directory contains the smart contracts for the SplitChain application.

## Contracts Overview

### SplitChainFactory.sol

The factory contract that creates and keeps track of expense groups.

**Key Functions:**

- `createExpenseGroup`: Creates a new expense group
- `getAllExpenseGroups`: Gets all expense groups created
- `getUserCreatedGroups`: Gets all groups created by a specific user
- `getUserGroups`: Gets all groups a user is a member of

### ExpenseGroup.sol

The main contract for managing expenses within a group.

**Key Functions:**

- `addMember`: Add a new member to the group
- `removeMember`: Remove a member from the group
- `addExpense`: Add a new expense to the group
- `settleDebt`: Settle a debt by paying another member
- `getAllExpenses`: Get all expenses in the group
- `getAllMembers`: Get all members in the group
- `getMemberBalance`: Get the current balance of a member
- `deactivateGroup`/`reactivateGroup`: Enable/disable the group's functionality

## Contract Relationships

- `SplitChainFactory` creates instances of `ExpenseGroup` contracts
- Each `ExpenseGroup` is independent and manages its own members, expenses, and balances
- The factory keeps references to all created groups for discovery

## Development

### Prerequisites

- Node.js and npm
- Hardhat

### Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy-to-network.js --network sepolia

# Verify contracts on Etherscan
npx hardhat run scripts/verify-contracts.js --network sepolia
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PRIVATE_KEY=your-private-key-here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-api-key
ETHERSCAN_API_KEY=your-etherscan-api-key
```

## Contract Design Decisions

1. **Factory Pattern**: Using a factory pattern allows for easy discovery of all created expense groups and provides a central registry.

2. **Ownable Contract**: The ExpenseGroup inherits from OpenZeppelin's Ownable contract to manage permissions.

3. **Balances as int256**: We use signed integers to represent balances since users can either owe money (negative balance) or be owed money (positive balance).

4. **Expense and Settlement Structures**: We define custom structures to store all relevant information about expenses and settlements.

## Security Considerations

1. **Access Control**: Only the group owner can add/remove members. Only members can add expenses.

2. **Balance Checks**: Members can only be removed if they have no outstanding balances.

3. **Active Status**: Groups can be deactivated to prevent further expense additions or settlements.

## Future Improvements

1. **Multi-token Support**: Allow expenses in different tokens/currencies.

2. **Recurring Expenses**: Support for expenses that repeat on a schedule.

3. **Expense Categories and Budget Limits**: Add support for categorizing expenses and setting budget limits.

4. **Governance**: Allow for decentralized decision-making within groups.
