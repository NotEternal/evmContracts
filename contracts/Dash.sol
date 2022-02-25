// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IStorage.sol";


contract Dash {
    using SafeMath for uint;

    AggregatorV3Interface internal priceAggregator;
    address aggregatorAddress;
    address storageAddress;
    address owner;
    address paymentDestination;
    address rewardToken;
    uint rewardAmount;
    mapping(string => int) productPrices;

    modifier onlyOwner() {
        require(msg.sender == owner, "FORBIDDEN");
        _;
    }

    modifier notEmpty(string memory _value) {
        bytes memory byteValue = bytes(_value);
        require(byteValue.length != 0, 'NO_VALUE');
        _;
    }

    constructor(
        address _storageAddress,
        address _owner,
        address _paymentDest,
        address _rewardToken,
        uint _rewardAmount,
        address _aggregatorAddress
    ) {
        aggregatorAddress = _aggregatorAddress;
        priceAggregator = AggregatorV3Interface(_aggregatorAddress);
        storageAddress = _storageAddress;
        owner = _owner;
        paymentDestination = _paymentDest;
        rewardToken = _rewardToken;
        rewardAmount = _rewardAmount;
    }

    function getLatestPrice() public view returns (int) {
        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }

    function getData(string memory _key) public view notEmpty(_key) returns(IStorage.Data memory) {
        return IStorage(storageAddress).getData(_key);
    }

    function payment(
        string _productId,
        string memory _key,
        string memory _data,
        address _rewardReceiver
    ) external payable notEmpty(_productId) notEmpty(_key) {
        /* TODO:
         * check all calculations and be sure in valid values (without (under|over)flowing)
         */
        int nativeCoinPrice = getLatestPrice();
        int fiatPrice = productPrices[_productId];
        require(fiatPrice >= 0, "EMPTY_PRODUCT_PRICE");
        uint degreeOfen = 0;
        while(fiatPrice < nativeCoinPrice) {
            fiatPrice = fiatPrice * 10;
            degreeOfen += 1;
        }
        uint amount = fiatPrice / nativeCoinPrice;
        uint value = msg.value.mul(10 ** degreeOfen);
        uint inaccuracyPercent = 1;
        uint acceptableInaccuracy = (amount / 100) * inaccuracyPercent;
        require(value > (amount - acceptableInaccuracy) && value < (amount + acceptableInaccuracy), "WRONG_VALUE");
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

    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
    }

    function setAggregatorAddress(address _aggregatorAddress) public onlyOwner {
        aggregatorAddress = _aggregatorAddress;
    }

    function setPaymentDestination(address _moneyDest) public onlyOwner {
        paymentDestination = _moneyDest;
    }

    function setStorage(address _storageAddress) public onlyOwner {
        storageAddress = _storageAddress;
    }
}