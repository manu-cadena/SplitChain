// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SplitChainFactory
 * @dev Factory contract for creating and managing expense groups
 */
contract SplitChainFactory {
    // Simple array to store all created expense group addresses
    address[] public expenseGroups;
    
    // Event emitted when a new expense group is created
    event ExpenseGroupCreated(
        address indexed groupAddress,
        address indexed creator,
        string name,
        uint256 timestamp
    );
    
    /**
     * @dev Gets all expense groups created
     * @return Array of expense group addresses
     */
    function getAllExpenseGroups() external view returns (address[] memory) {
        return expenseGroups;
    }
}