// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {ClearLedgerInvoice} from "../contracts/ClearLedgerInvoice.sol";

contract DeployClearLedger is Script {
    function run() external returns (ClearLedgerInvoice ledger) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        ledger = new ClearLedgerInvoice();
        vm.stopBroadcast();
    }
}
