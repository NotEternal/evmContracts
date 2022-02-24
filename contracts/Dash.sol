// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./interfaces/IERC20.sol";

contract DashV1 {
    struct Data {
        address owner;
        mapping(string => uint) products;
    }

    address owner;
    address paymentDestination;
    address rewardToken;
    uint rewardAmount;
    mapping(address => Data) userData;
    address[] public users;

    modifier onlyOwner(address _account) {
        require(userData[_account].owner != address(0), "NO_OWNER");
        require(msg.sender == userData[_account].owner, "FORBIDDEN");
        _;
    }

    constructor(address _owner, address _paymentDest, address _rewardToken, uint _rewardAmount) {
        owner = _owner;
        paymentDestination = _paymentDest;
        rewardToken = _rewardToken;
        rewardAmount = _rewardAmount;
    }

    // function getData(address _account) public view returns(Data memory) {
    //     return userData[_account];
    // }

    function payment(address _account, string memory _productId) external payable {
        require(msg.value > 0, "EMPTY_VALUE");
        if (userData[_account].owner != address(0)) {
            require(msg.sender == userData[_account].owner, "FORBIDDEN");
        } else {
            users.push(_account);
        }
        (bool success,) = paymentDestination.call{value: msg.value}("");
        require(success, "FAILED_PAYMENT");
        setData(_account, _productId);
        if (IERC20(rewardToken).balanceOf(address(this)) >= rewardAmount) {
            sendReward(_account);
        }
    }

    function cleanData(address _account) public onlyOwner(_account) {
        require(msg.sender == userData[_account].owner, "FORBIDDEN");
        delete userData[_account];
        bool arrayOffset;
        for(uint x; x < users.length - 1; x++) {
            if (keccak256(abi.encodePacked(users[x])) == keccak256(abi.encodePacked(_account))) {
                arrayOffset = true;
            }
            if (arrayOffset) users[x] = users[x + 1];
        }
        if (arrayOffset) users.pop();
    }

    function setData(address _account, string memory _productId) private {
        require(msg.sender == userData[_account].owner, "FORBIDDEN");
        userData[_account].products[_productId] = block.timestamp;
    }

    function sendReward(address _account) private {
        require(IERC20(rewardToken).balanceOf(address(this)) >= rewardAmount, "INSUFFICIENT_FUNDS");
        bool success = IERC20(rewardToken).transferFrom(address(this), _account, rewardAmount);
        require(success, "FAILED_REWARD");
    }

    function setOwner(address _owner) public {
        require(msg.sender == owner, "FORBIDDEN");
        owner = _owner;
    }

    function setPaymentDestination(address _moneyDest) public {
        require(msg.sender == owner, "FORBIDDEN");
        paymentDestination = _moneyDest;
    }
}