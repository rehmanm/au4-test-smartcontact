// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "hardhat/console.sol";

contract Faucet {
    address payable public owner;

    constructor() payable {
        owner = payable(msg.sender);
    }

    function withdraw(uint _amount) payable public {
        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        require(sent, "Failed to send ether");
    }

    function withdrawAll() onlyOwner public {
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    function destroyFaucet() onlyOwner public {      
        selfdestruct(owner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "required by owner");
        _;
    }
}