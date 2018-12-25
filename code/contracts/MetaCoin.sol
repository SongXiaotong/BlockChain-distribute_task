pragma solidity ^0.4.24;

import "./ConvertLib.sol";

contract MetaCoin {
	mapping (address => uint) balances;
	mapping (address => string) address_name;
	mapping (string => address) name_address;
	mapping (uint => string) tasklist;
	uint tasknum;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	constructor() public {
		tasknum = 0;
		balances[tx.origin] = 100;
	}

	function setName(address settee, string setter) public returns(string) {
		address_name[settee] = setter;
		name_address[setter] = settee;
		return address_name[settee];
	}
	function addTask(string task) public returns(bool){
		tasklist[tasknum] = task;
		tasknum = tasknum + 1;
		return true;
	}
	function getTaskNum() public view returns (uint){
		return tasknum;
	}
	function getTaskBySeq(uint seq) public view returns (string){
		return tasklist[seq];
	}
	function getName(address addr) public view returns(string) {
		return address_name[addr];
	}
	function getAddressByName(string name) public view returns(address){
		return name_address[name];
	}

	function disTask(string name, uint amount) public returns(uint) {
		
		if (balances[msg.sender] < amount) return tasknum-tasknum;
		address receiver = name_address[name];
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		emit Transfer(msg.sender, receiver, amount);
		return tasknum+1;
	}

	function deleteTask(string name, uint amount) public returns(uint) {
		
		if (balances[name_address[name]] < amount) return 0;
		address receiver = name_address[name];
		balances[msg.sender] += amount;
		balances[receiver] -= amount;
		emit Transfer(receiver, msg.sender, amount);
		return 1;
	}


	function getBalanceInEth(address addr) public view returns(uint){
		return ConvertLib.convert(getBalance(addr),2);
	}

	function getBalance(address addr) public view returns(uint) {
		return balances[addr];
	}
}
