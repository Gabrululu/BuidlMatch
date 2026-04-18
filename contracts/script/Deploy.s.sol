// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BuilderRegistry.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        BuilderRegistry registry = new BuilderRegistry();
        vm.stopBroadcast();
        console.log("BuilderRegistry deployed at:", address(registry));
    }
}
