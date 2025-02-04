// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "./IERC20.sol";

contract Storage {
    IERC20 token;

    address public tokenAddress;

    mapping(address => uint256) public tokenAmount;

    mapping(address => mapping(address => uint256)) public tokenBalances;

    event tokenReceived(address indexed token, address indexed sender, uint256 amount);
    event tokenSended(address indexed token, address indexed sender, uint256 amount);
    event tokenChanged(address indexed newToken, address indexed oldToken);

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
        token = IERC20(tokenAddress);
    }

    function getUserBalance(address userAddress) public view returns(uint256) {
        return tokenBalances[userAddress][tokenAddress];
    }

    function getUserTokenBalance(address userAddress) public view returns(uint256) {
        return token.balanceOf(userAddress);
    }

    function getTokenAmount() public view returns(uint256) {
        return tokenAmount[tokenAddress];
    }

    function changeToken(address _tokenAddress) public {
        emit tokenChanged(_tokenAddress, tokenAddress);
        tokenAddress = _tokenAddress;
    }

    function deposit(uint256 _amount) public {
        require(token.balanceOf(msg.sender) >= _amount, "Not anough tokens for deposit");
        require(token.transferFrom(msg.sender, address(this), _amount), "Deposit failed");

        tokenBalances[msg.sender][tokenAddress] += _amount;
        tokenAmount[tokenAddress] += _amount;

        emit tokenReceived(tokenAddress, msg.sender, _amount);
    }

    function withdrawTokens(uint _amount) public {
        require(tokenBalances[msg.sender][tokenAddress] >= _amount, "Not anought tokens for withdraw");
        require(token.transfer(msg.sender, _amount), "Transfer failed");

        tokenBalances[msg.sender][tokenAddress] -= _amount;
        tokenAmount[tokenAddress] -= _amount;

        emit tokenSended(tokenAddress, msg.sender, _amount);
    }
}