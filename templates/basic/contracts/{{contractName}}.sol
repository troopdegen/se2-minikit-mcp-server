// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title {{contractName}}
 * @author {{author}}
 * @notice A simple smart contract demonstrating Scaffold-ETH 2 basics
 * @dev This contract allows storing and updating a greeting message
 */
contract {{contractName}} {
    /// @notice The current greeting message
    string public greeting;

    /// @notice The owner of the contract
    address public owner;

    /// @notice Emitted when the greeting is updated
    event GreetingChanged(
        address indexed changer,
        string newGreeting,
        uint256 timestamp
    );

    /// @notice Thrown when a non-owner tries to call an owner-only function
    error OnlyOwner();

    /// @notice Thrown when an empty greeting is provided
    error EmptyGreeting();

    /**
     * @notice Contract constructor
     * @param _greeting The initial greeting message
     */
    constructor(string memory _greeting) {
        if (bytes(_greeting).length == 0) revert EmptyGreeting();

        greeting = _greeting;
        owner = msg.sender;

        emit GreetingChanged(msg.sender, _greeting, block.timestamp);
    }

    /**
     * @notice Updates the greeting message (owner only)
     * @param _newGreeting The new greeting message
     */
    function setGreeting(string memory _newGreeting) external {
        if (msg.sender != owner) revert OnlyOwner();
        if (bytes(_newGreeting).length == 0) revert EmptyGreeting();

        greeting = _newGreeting;
        emit GreetingChanged(msg.sender, _newGreeting, block.timestamp);
    }

    /**
     * @notice Gets the current greeting
     * @return The current greeting message
     */
    function getGreeting() external view returns (string memory) {
        return greeting;
    }

    /**
     * @notice Checks if an address is the owner
     * @param _address The address to check
     * @return True if the address is the owner
     */
    function isOwner(address _address) external view returns (bool) {
        return _address == owner;
    }
}
