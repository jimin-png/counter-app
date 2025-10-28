// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Counter {
    uint256 private counter;
    address private _owner;

    constructor() {
        _owner = msg.sender;
        counter = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner");
        _;
    }

    function incrementCounter() external {
        counter += 1;
    }

    function decrementCounter() external {
        require(counter > 0, "Counter underflow");
        counter -= 1;
    }

    function resetCounter() external onlyOwner {
        counter = 0;
    }

    function getCounter() external view returns (uint256) {
        return counter;
    }

    function owner() external view returns (address) {
        return _owner;
    }
}
