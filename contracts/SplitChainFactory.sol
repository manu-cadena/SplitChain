// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ExpenseGroup.sol";

/**
 * @title SplitChainFactory
 * @dev Factory contract for creating and managing ExpenseGroup contracts
 */
contract SplitChainFactory {
    // Array to store all created expense group addresses
    address[] public expenseGroups;
    
    // Mapping from group address to creator address
    mapping(address => address) public groupCreators;
    
    // Mapping from user address to their created groups
    mapping(address => address[]) public userCreatedGroups;
    
    // Mapping from user address to groups they are a member of
    mapping(address => address[]) public userGroups;
    
    // Event emitted when a new expense group is created
    event ExpenseGroupCreated(
        address indexed groupAddress,
        address indexed creator,
        string name,
        uint256 timestamp
    );
    
    /**
     * @dev Creates a new expense group
     * @param _name Name of the expense group
     * @param _description Description of the expense group
     * @param _members Initial members of the group (including creator)
     * @return Address of the newly created expense group
     */
    function createExpenseGroup(
        string memory _name,
        string memory _description,
        address[] memory _members
    ) external returns (address) {
        // Create new expense group contract
        ExpenseGroup newGroup = new ExpenseGroup(
            _name,
            _description,
            msg.sender,
            _members
        );
        
        address groupAddress = address(newGroup);
        
        // Store group information
        expenseGroups.push(groupAddress);
        groupCreators[groupAddress] = msg.sender;
        userCreatedGroups[msg.sender].push(groupAddress);
        
        // Add group to all members' lists
        for (uint i = 0; i < _members.length; i++) {
            userGroups[_members[i]].push(groupAddress);
        }
        
        // Emit event
        emit ExpenseGroupCreated(
            groupAddress,
            msg.sender,
            _name,
            block.timestamp
        );
        
        return groupAddress;
    }
    
    /**
     * @dev Gets all expense groups created
     * @return Array of expense group addresses
     */
    function getAllExpenseGroups() external view returns (address[] memory) {
        return expenseGroups;
    }
    
    /**
     * @dev Gets all expense groups created by a specific user
     * @param _user Address of the user
     * @return Array of expense group addresses created by the user
     */
    function getUserCreatedGroups(address _user) external view returns (address[] memory) {
        return userCreatedGroups[_user];
    }
    
    /**
     * @dev Gets all expense groups a user is a member of
     * @param _user Address of the user
     * @return Array of expense group addresses the user is a member of
     */
    function getUserGroups(address _user) external view returns (address[] memory) {
        return userGroups[_user];
    }
}