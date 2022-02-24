// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract SimpleStorage {
    address private _owner;
    string private _settings;

    modifier onlyOwner() {
        require(msg.sender == _owner, 'Owner: FORBIDDEN');
        _;
    }

    constructor(address owner_) {
        _owner = owner_;
    }

    function owner() external view returns(address) {
        return _owner;
    }

    function settings() external view returns(string memory) {
        return _settings;
    }

    function setOwner(address owner_) external onlyOwner {
        require(owner_ != address(0), 'ZERO_ADDRESS');
        _owner = owner_;
    }

    function setSettings(string memory settings_) external onlyOwner {
        _setSettings(settings_);
    }

    function _setSettings(string memory settings_) private {
        _settings = settings_;
    }
}