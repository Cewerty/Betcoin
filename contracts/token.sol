// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Betcoin {
    string public name = "Betcoin";

    string public symbol = "BET";

    uint8 public decimals = 18;

    uint256 public totalSupply;


    mapping(address => uint256) public balanceOf;

    mapping(address => mapping(address => uint256)) public allowance;


    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);


    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;

        emit Transfer(address(0), msg.sender, totalSupply);
    }

// Добавьте эту функцию в контракт
    function getBalanceOf(address _owner) public view returns (uint256) {
        return balanceOf[_owner];
    }


    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Not enough balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Not enough balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function allowanceOf(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowance[_owner][_spender];
    }

    function mint(uint _amount) public returns (bool success) {
        require(_amount > 0, "You can not mint zero tokens.");
        totalSupply = totalSupply + _amount;
        balanceOf[msg.sender] += _amount;
        return true;
    }

    function burn(uint _amount) public returns(bool success) {
        require(balanceOf[msg.sender] >= _amount, "You can not burn more tokens than you have.");
        require(_amount > 0, "You can not burn zero tokens.");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        emit Transfer(msg.sender, address(0), _amount);
        return true;
    }

    function burnFrom(address _from, uint _amount) public returns(bool success) {
        require(_amount > 0, "You can not burn zero tokens");
        require(balanceOf[_from] >= _amount, "Not enough balance");
        require(allowance[_from][msg.sender] >= _amount, "Allowance exceeded");

        balanceOf[_from] -= _amount;
        allowance[_from][msg.sender] -= _amount;
        totalSupply -= _amount;
        
        emit Transfer(_from, address(0), _amount);

        return true;
    }
}
