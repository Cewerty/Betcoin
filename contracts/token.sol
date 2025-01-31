
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Betcoin {
    string public name = "Betcoin";
    string public symbol = "BET";
    uint8 public decimals = 18;
    uint8 public rewardCof = 13;
    uint256 public totalStaked = 1;
    uint256 public totalSupply;
    uint256 public tokenCap;
    bool public paused;
    address public owner;

    uint256 public maximumStakingPeriod;
    uint256 public minimumStakingPeriod;
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
    }
    struct Reward {
        uint256 stakeIndex;
        uint256 rewardTime;
    }
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    mapping(address => bool) public blacklist;
    mapping(address => Stake[]) public staked;
    mapping(address => Reward[]) public lastRewardTime;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * (10 ** uint256(decimals));
        tokenCap = initialSupply;
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    modifier isNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
    modifier isPaused() {
        require(paused, "Contract not paused");
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "This function can use only contract owner.");
        _;
    }
    modifier isNotBlacklisted() {
        require(!blacklist[msg.sender], 'This function allowed only for non blacklisted users.');
        _;
    }
    function pause() public onlyOwner() isNotPaused() {
        paused = true;
    }
    function unpause() public onlyOwner() isPaused() {
        paused = false;
    }
    function setTokenCap(uint256 _amount) public onlyOwner() {
        tokenCap = _amount;
    }
    function blacklistAddress(address _address) public onlyOwner() {
        blacklist[_address] = true;
    }
    function unblacklistAddress(address _address) public onlyOwner() {
        blacklist[_address] = false;
    }
    function setMinimumStakingPeriod(uint256 newMinimumStakingPeriod) public onlyOwner() {
        minimumStakingPeriod = newMinimumStakingPeriod;
    }
    function setMaximumStakingPeriod(uint256 newMaximumStakingPeriod) public onlyOwner() {
        maximumStakingPeriod = newMaximumStakingPeriod;
    }
    function transfer(address _to, uint256 _value) public isNotPaused() isNotBlacklisted() returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Not enough balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public isNotPaused() isNotBlacklisted() returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public isNotPaused() isNotBlacklisted() returns (bool success) {
        require(balanceOf[_from] >= _value, "Not enough balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
    function allowanceOf(address _owner, address _spender) public isNotBlacklisted() view returns (uint256 remaining) {
        return allowance[_owner][_spender];
    }
    function mint(uint _amount) public onlyOwner() isNotPaused() returns (bool success) {
        require(_amount > 0, "You can not mint zero tokens.");
        require((totalSupply + _amount) <= tokenCap, "Mint is going above token cap.");
        totalSupply += _amount;
        balanceOf[msg.sender] += _amount;
        return true;
    }
    function burn(uint _amount) public isNotBlacklisted() returns(bool success) {
        require(balanceOf[msg.sender] >= _amount, "You can not burn more tokens than you have.");
        require(_amount > 0, "You can not burn zero tokens.");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        emit Transfer(msg.sender, address(0), _amount);
        return true;
    }
    function burnFrom(address _from, uint _amount) public isNotBlacklisted() returns(bool success) {
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
