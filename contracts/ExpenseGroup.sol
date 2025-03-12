// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ExpenseGroup
 * @dev Manages expenses and settlements within a group
 */
contract ExpenseGroup is Ownable {
    // Group information
    string public name;
    string public description;
    address public creator;
    uint256 public creationTime;
    bool public isActive;
    
    // Member management
    address[] public members;
    mapping(address => bool) public isMember;
    
    // Expense structure
    struct Expense {
        uint256 id;
        string title;
        string description;
        string category;
        uint256 amount;
        address paidBy;
        address[] sharedWith;
        string receiptIPFSHash; // IPFS hash for receipt storage
        uint256 timestamp;
        bool settled;
    }
    
    // Settlement structure
    struct Settlement {
        address payer;
        address receiver;
        uint256 amount;
        uint256 timestamp;
        bool completed;
    }
    
    // Storage for expenses and settlements
    Expense[] public expenses;
    Settlement[] public settlements;
    
    // Balances for each member
    mapping(address => int256) public balances; // Can be negative (owes money) or positive (is owed money)
    
    // Events
    event MemberAdded(address indexed member, uint256 timestamp);
    event MemberRemoved(address indexed member, uint256 timestamp);
    event ExpenseAdded(
        uint256 indexed expenseId,
        address indexed paidBy,
        uint256 amount,
        string category,
        uint256 timestamp
    );
    event SettlementCreated(
        address indexed payer,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );
    event SettlementCompleted(
        address indexed payer,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor to initialize the expense group
     * @param _name Name of the group
     * @param _description Description of the group
     * @param _creator Address of the creator
     * @param _initialMembers Array of initial member addresses
     */
    constructor(
        string memory _name,
        string memory _description,
        address _creator,
        address[] memory _initialMembers
    ) Ownable(_creator) {
        name = _name;
        description = _description;
        creator = _creator;
        creationTime = block.timestamp;
        isActive = true;
        
        // Add creator as a member if not already included
        bool creatorIncluded = false;
        for (uint i = 0; i < _initialMembers.length; i++) {
            if (_initialMembers[i] == _creator) {
                creatorIncluded = true;
                break;
            }
        }
        
        if (!creatorIncluded) {
            address[] memory membersWithCreator = new address[](_initialMembers.length + 1);
            membersWithCreator[0] = _creator;
            for (uint i = 0; i < _initialMembers.length; i++) {
                membersWithCreator[i + 1] = _initialMembers[i];
            }
            _addInitialMembers(membersWithCreator);
        } else {
            _addInitialMembers(_initialMembers);
        }
    }
    
    /**
     * @dev Internal function to add initial members
     * @param _members Array of member addresses
     */
    function _addInitialMembers(address[] memory _members) internal {
        for (uint i = 0; i < _members.length; i++) {
            address member = _members[i];
            if (member != address(0) && !isMember[member]) {
                members.push(member);
                isMember[member] = true;
                emit MemberAdded(member, block.timestamp);
            }
        }
    }
    
    /**
     * @dev Add a new member to the group
     * @param _member Address of the new member
     */
    function addMember(address _member) external onlyOwner {
        require(_member != address(0), "Invalid member address");
        require(!isMember[_member], "Already a member");
        
        members.push(_member);
        isMember[_member] = true;
        emit MemberAdded(_member, block.timestamp);
    }
    
    /**
     * @dev Remove a member from the group
     * @param _member Address of the member to remove
     */
    function removeMember(address _member) external onlyOwner {
        require(isMember[_member], "Not a member");
        require(_member != creator, "Cannot remove creator");
        require(balances[_member] == 0, "Member has unsettled balances");
        
        // Find and remove member from array
        for (uint i = 0; i < members.length; i++) {
            if (members[i] == _member) {
                // Move the last element to the position of the removed element
                members[i] = members[members.length - 1];
                // Remove the last element
                members.pop();
                break;
            }
        }
        
        isMember[_member] = false;
        emit MemberRemoved(_member, block.timestamp);
    }
    
    /**
     * @dev Add a new expense to the group
     * @param _title Title of the expense
     * @param _description Description of the expense
     * @param _category Category of the expense
     * @param _amount Amount of the expense
     * @param _sharedWith Array of members the expense is shared with
     * @param _receiptIPFSHash IPFS hash of the receipt (if any)
     */
    function addExpense(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _amount,
        address[] memory _sharedWith,
        string memory _receiptIPFSHash
    ) external {
        require(isActive, "Group is not active");
        require(isMember[msg.sender], "Only members can add expenses");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Validate that all shared members exist in the group
        for (uint i = 0; i < _sharedWith.length; i++) {
            require(isMember[_sharedWith[i]], "Shared member not in group");
        }
        
        // Create new expense
        uint256 expenseId = expenses.length;
        Expense memory newExpense = Expense({
            id: expenseId,
            title: _title,
            description: _description,
            category: _category,
            amount: _amount,
            paidBy: msg.sender,
            sharedWith: _sharedWith,
            receiptIPFSHash: _receiptIPFSHash,
            timestamp: block.timestamp,
            settled: false
        });
        
        expenses.push(newExpense);
        
        // Update balances
        uint256 shareCount = _sharedWith.length;
        require(shareCount > 0, "Must share with at least one member");
        
        uint256 shareAmount = _amount / shareCount;
        
        // Credit the payer
        balances[msg.sender] += int256(_amount);
        
        // Debit each member who shares the expense
        for (uint i = 0; i < shareCount; i++) {
            address member = _sharedWith[i];
            balances[member] -= int256(shareAmount);
        }
        
        emit ExpenseAdded(expenseId, msg.sender, _amount, _category, block.timestamp);
    }
    
    /**
     * @dev Get all expenses in the group
     * @return Array of all expenses
     */
    function getAllExpenses() external view returns (Expense[] memory) {
        return expenses;
    }
    
    /**
     * @dev Get all members in the group
     * @return Array of member addresses
     */
    function getAllMembers() external view returns (address[] memory) {
        return members;
    }
    
    /**
     * @dev Get the current balance of a member
     * @param _member Address of the member
     * @return Current balance (positive if owed money, negative if owes money)
     */
    function getMemberBalance(address _member) external view returns (int256) {
        require(isMember[_member], "Not a member");
        return balances[_member];
    }
    
    /**
     * @dev Settle a debt by paying another member
     * @param _receiver Address of the member to receive payment
     */
    function settleDebt(address _receiver) external payable {
        require(isActive, "Group is not active");
        require(isMember[msg.sender], "Only members can settle debts");
        require(isMember[_receiver], "Receiver is not a member");
        require(balances[msg.sender] < 0, "You don't have debt to settle");
        require(balances[_receiver] > 0, "Receiver is not owed money");
        
        // Calculate the debt amount (minimum of what sender owes and what receiver is owed)
        uint256 debtAmount = uint256(min(-balances[msg.sender], balances[_receiver]));
        
        // Verify sent amount matches debt amount
        require(msg.value == debtAmount, "Sent value doesn't match debt amount");
        
        // Update balances
        balances[msg.sender] += int256(debtAmount);
        balances[_receiver] -= int256(debtAmount);
        
        // Record settlement
        settlements.push(Settlement({
            payer: msg.sender,
            receiver: _receiver,
            amount: debtAmount,
            timestamp: block.timestamp,
            completed: true
        }));
        
        // Transfer funds to receiver
        payable(_receiver).transfer(debtAmount);
        
        emit SettlementCompleted(msg.sender, _receiver, debtAmount, block.timestamp);
    }
    
    /**
     * @dev Helper function to get minimum of two int256 values
     */
    function min(int256 a, int256 b) internal pure returns (int256) {
        return a < b ? a : b;
    }
    
    /**
     * @dev Deactivate the group (only owner can call)
     */
    function deactivateGroup() external onlyOwner {
        isActive = false;
    }
    
    /**
     * @dev Reactivate the group (only owner can call)
     */
    function reactivateGroup() external onlyOwner {
        isActive = true;
    }
}