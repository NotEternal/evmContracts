// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./libraries/SafeMath.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IStorage.sol";


contract Dash {
    using SafeMath for uint;

    struct ProductItem {
        string productId;
        uint price;
    }

    AggregatorV3Interface internal priceAggregator;
    bool blocked;
    address aggregatorAddress;
    address storageAddress;
    address paymentDestination;
    address rewardToken;
    uint rewardAmount;
    mapping(string => uint) private productPrices;
    mapping(address => address) private owners;

    modifier onlyOwners() {
        require(owners[msg.sender] == msg.sender, "FORBIDDEN");
        _;
    }

    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    modifier notEmpty(string memory _value) {
        bytes memory byteValue = bytes(_value);
        require(byteValue.length != 0, "NO_VALUE");
        _;
    }

    event Payment(address from, string productId, uint paymentAmount, uint nativeCoinPrice);

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
        owners[_owner] = _owner;
        paymentDestination = _paymentDest;
        rewardToken = _rewardToken;
        rewardAmount = _rewardAmount;
    }

    function getLatestPrice() public view returns (uint) {
        (,int price,,,) = priceAggregator.latestRoundData();
        if (price >= 0) {
            return uint(price);
        }
        return 0;
    }

    function getData(string memory _key) public view notEmpty(_key) returns(IStorage.Data memory) {
        return IStorage(storageAddress).getData(_key);
    }

    function payment(
        string memory _productId,
        string memory _key,
        string memory _data,
        address _rewardReceiver
    ) external payable lock notEmpty(_productId) notEmpty(_key) {
        if (blocked) return;
        require(aggregatorAddress != address(0), "NO_AGGREGATOR_ADDR");
        uint nativeCoinPrice = getLatestPrice();
        uint productPrice = productPrices[_productId];
        require(nativeCoinPrice > 0 && productPrice >= 0, "WRONG_PRICE");
        uint degreeOfTen;
        while(productPrice < nativeCoinPrice) {
            productPrice = productPrice.mul(10);
            degreeOfTen += 1;
        }
        uint weiDecimals = 10 ** 18;
        uint amount = productPrice.mul(weiDecimals) / nativeCoinPrice;
        uint value = msg.value.mul(10 ** degreeOfTen);
        uint acceptableInaccuracy = amount / 100; // 1%
        require(value > (amount - acceptableInaccuracy) && value < (amount + acceptableInaccuracy), "WRONG_VALUE");
        (bool success,) = paymentDestination.call{ value: msg.value }("");
        require(success, "FAILED_PAYMENT");
        setData(_key, _data);
        emit Payment(msg.sender, _productId, msg.value, nativeCoinPrice);
        if (IERC20(rewardToken).balanceOf(address(this)) >= rewardAmount) {
            sendReward(_rewardReceiver);
        }
    }

    function clearData(string memory _key) public {
        IStorage(storageAddress).clearKeyData(_key);
    }

    function setBlocked(bool _blocked) public onlyOwners {
        blocked = _blocked;
    }

    function addOwner(address _owner) public onlyOwners {
        owners[_owner] = _owner;
    }

    function removeOwner(address _owner) public onlyOwners {
        delete owners[_owner];
    }

    function setAggregatorAddress(address _aggregatorAddress) public onlyOwners {
        aggregatorAddress = _aggregatorAddress;
    }

    function setPaymentDestination(address _moneyDest) public onlyOwners {
        paymentDestination = _moneyDest;
    }

    function setStorage(address _storageAddress) public onlyOwners {
        storageAddress = _storageAddress;
    }

    function setProductPrice(string _productId, uint _price) public onlyOwners {
        productPrices[_productId] = _price;
    }

    function setProductsPrices(ProductItem[] memory _productItems) public onlyOwners {
        require(_productItems.length > 0, "NO_ITEMS");
        for(uint x; x < _productItems.length; x++) {
            productPrices[_productItems[x].productId] = _productItems[x].price;
        }
    }

    function setData(string memory _key, string memory _data) private {
        IStorage(storageAddress).setKeyData(_key, IStorage.Data({owner: address(this), info: _data}));
    }

    function sendReward(address _to) private {
        require(IERC20(rewardToken).balanceOf(address(this)) >= rewardAmount, "INSUFFICIENT_FUNDS");
        bool success = IERC20(rewardToken).transferFrom(address(this), _to, rewardAmount);
        require(success, "FAILED_REWARD");
    }
}