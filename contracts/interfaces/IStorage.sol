// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IStorage {
    struct Data {
        address owner;
        string info;
    }

    function getData(string memory _key) external view returns(Data memory);
    function allKeys() external view returns(string[] memory);
    function allKeysData() external view returns(Data[] memory);
    function setData(string memory _key, Data memory _data) external;
    function clearData(string memory _key) external;
}