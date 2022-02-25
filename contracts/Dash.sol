// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./interfaces/IERC20.sol";
import "./interfaces/IStorage.sol";

contract Dash {
    address storageAddress;
    address owner;
    address paymentDestination;
    address rewardToken;
    uint rewardAmount;

    constructor(address _storageAddress, address _owner, address _paymentDest, address _rewardToken, uint _rewardAmount) {
        storageAddress = _storageAddress;
        owner = _owner;
        paymentDestination = _paymentDest;
        rewardToken = _rewardToken;
        rewardAmount = _rewardAmount;
    }

    function getData(string memory _key) public view returns(IStorage.Data memory) {
        return IStorage(storageAddress).getData(_key);
    }

    function payment(string memory _key, string memory _data, address _rewardReceiver) external payable {
        require(msg.value > 0, "EMPTY_VALUE");
        (bool success,) = paymentDestination.call{value: msg.value}("");
        require(success, "FAILED_PAYMENT");
        setData(_key, _data);
        if (IERC20(rewardToken).balanceOf(address(this)) >= rewardAmount) {
            sendReward(_rewardReceiver);
        }
    }

    function clearData(string memory _key) public {
        IStorage(storageAddress).clearData(_key);
    }

    function setData(string memory _key, string memory _data) private {
        IStorage(storageAddress).setData(_key, IStorage.Data({owner: address(this), info: _data}));
    }

    function sendReward(address _to) private {
        require(IERC20(rewardToken).balanceOf(address(this)) >= rewardAmount, "INSUFFICIENT_FUNDS");
        bool success = IERC20(rewardToken).transferFrom(address(this), _to, rewardAmount);
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

    function setStorage(address _storageAddress) public {
        require(msg.sender == owner, "FORBIDDEN");
        storageAddress = _storageAddress;
    }
}