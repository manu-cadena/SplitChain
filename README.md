# SplitChain

SplitChain is a blockchain-based expense tracking and splitting application designed to help groups transparently manage and divide costs during shared activities, such as trips, events, or crowdfunding campaigns. The app leverages blockchain technology to ensure secure, transparent, and immutable records of transactions for each group.

## Features

### Core Features

- **Group Expense Tracking**: Record all shared expenses in real-time
- **Blockchain-Powered**: Secure and immutable records of every transaction
- **Smart Contracts**: Automate payments and settlements among group members
- **Cryptocurrency Integration**: Accept and track expenses in cryptocurrencies
- **Multi-wallet Support**: Connect with MetaMask, WalletConnect, Coinbase Wallet
- **Transaction History**: Detailed view of all expenses with filtering options

### Enhanced Features

- **Expense Categories**: Categorize expenses (food, transportation, accommodation, etc.)
- **Receipt Storage**: Upload and store receipts using IPFS
- **Notifications**: Alert users when they need to contribute or when expenses are settled
- **Global Participation**: Works seamlessly across borders without traditional banking barriers
- **Crowdfunding-Friendly**: Use for fundraising and ensure transparent use of funds

## How It Works

1. **Create a Group**: Start by setting up a group for your trip or event
2. **Connect Wallet**: Link your cryptocurrency wallet to your account
3. **Add Members**: Invite participants via wallet address or email
4. **Add Expenses**: Each participant can add expenses and specify who paid
5. **Upload Receipts**: Store receipt images on IPFS for transparency
6. **Automatic Calculations**: SplitChain calculates who owes what based on all transactions
7. **Smart Contract Settlement**: Trigger automated payments through smart contracts to settle balances instantly
8. **Transaction History**: View complete history of all expenses and settlements

## Tech Stack

- **Blockchain**: Ethereum (using Hardhat development environment)
- **Smart Contracts**: Solidity
- **Frontend**: React with ethers.js for blockchain interaction
- **UI Framework**: Tailwind CSS
- **Storage**: IPFS for decentralized storage of receipts and metadata
- **Wallet Integration**: MetaMask, WalletConnect, and other providers
- **Testing**: Hardhat testing framework and React Testing Library

## Project Roadmap

### Phase 1: Development Setup and Core Contracts

- Set up Hardhat development environment
- Design and implement core smart contracts
- Create basic React app with wallet connection
- Implement smart contract tests

### Phase 2: Basic Expense Tracking

- Develop group creation functionality
- Implement expense recording features
- Create settlement calculation logic
- Build basic UI for group management

### Phase 3: Enhanced Features

- Add receipt storage with IPFS
- Implement expense categories and filtering
- Create detailed transaction history view
- Add multi-wallet support

### Phase 4: Testing and Deployment

- Deploy to Ethereum testnet (Sepolia)
- Conduct user testing
- Bug fixes and optimizations
- Prepare for mainnet deployment

### Phase 5: Advanced Features

- Add multi-currency support
- Implement recurring expenses
- Create mobile responsive design
- Add notification system

## Getting Started

### Prerequisites

- Node.js and npm
- MetaMask or other Ethereum wallet
- Basic knowledge of React and blockchain concepts

### Installation

```bash
# Clone the repository
git clone https://github.com/manu-cadena/splitchain.git
cd splitchain

# Install dependencies
npm install

# Start the development server
npm start

# In a separate terminal, start the local Hardhat node
npx hardhat node

# Deploy contracts to local network
npx hardhat run scripts/deploy.js --network localhost
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
