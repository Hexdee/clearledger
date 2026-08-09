// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ClearLedgerInvoice} from "../contracts/ClearLedgerInvoice.sol";

contract MockAToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external { balanceOf[to] += amount; }
    function approve(address spender, uint256 amount) external returns (bool) { allowance[msg.sender][spender] = amount; return true; }
    function transfer(address to, uint256 amount) external returns (bool) { balanceOf[msg.sender] -= amount; balanceOf[to] += amount; return true; }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount; balanceOf[from] -= amount; balanceOf[to] += amount; return true;
    }
}

contract ClearLedgerInvoiceTest is Test {
    ClearLedgerInvoice ledger;
    MockAToken token;
    address supplier = makeAddr("supplier");
    address buyer = makeAddr("buyer");
    address funder = makeAddr("funder");

    function setUp() public {
        ledger = new ClearLedgerInvoice();
        token = new MockAToken();
        token.mint(funder, 9_000e6);
        token.mint(buyer, 10_000e6);
    }

    function _createAndConfirm() internal returns (uint256 id) {
        vm.prank(supplier);
        id = ledger.createInvoice(buyer, address(token), 10_000e6, 8_000e6, 8_300e6, uint64(block.timestamp + 30 days), keccak256("invoice"), keccak256("policy"));
        vm.prank(buyer);
        ledger.confirmInvoice(id);
    }

    function testCompleteInvoiceLifecycle() public {
        uint256 id = _createAndConfirm();
        vm.startPrank(funder); token.approve(address(ledger), 8_000e6); ledger.financeInvoice(id); vm.stopPrank();
        assertEq(token.balanceOf(supplier), 8_000e6);

        vm.startPrank(buyer); token.approve(address(ledger), 8_300e6); ledger.repayInvoice(id); vm.stopPrank();
        vm.prank(funder); ledger.claimRepayment(id);
        assertEq(token.balanceOf(funder), 9_300e6);
        (, , , , , , , , , , ClearLedgerInvoice.Status status) = ledger.invoices(id);
        assertEq(uint256(status), uint256(ClearLedgerInvoice.Status.Claimed));
    }

    function testOwnerIsRecordedForComplianceRegistration() public view {
        assertEq(ledger.owner(), address(this));
    }

    function testOnlyBuyerCanConfirm() public {
        vm.prank(supplier);
        uint256 id = ledger.createInvoice(buyer, address(token), 10_000e6, 8_000e6, 8_300e6, uint64(block.timestamp + 30 days), bytes32(0), bytes32(0));
        vm.expectRevert(ClearLedgerInvoice.NotBuyer.selector);
        vm.prank(funder);
        ledger.confirmInvoice(id);
    }

    function testCannotFinanceBeforeConfirmation() public {
        vm.prank(supplier);
        uint256 id = ledger.createInvoice(buyer, address(token), 10_000e6, 8_000e6, 8_300e6, uint64(block.timestamp + 30 days), bytes32(0), bytes32(0));
        vm.expectRevert(abi.encodeWithSelector(ClearLedgerInvoice.InvalidState.selector, ClearLedgerInvoice.Status.Confirmed, ClearLedgerInvoice.Status.Created));
        vm.prank(funder);
        ledger.financeInvoice(id);
    }
}
