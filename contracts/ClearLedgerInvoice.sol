// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ClearLedgerInvoice {
    enum Status {
        None,
        Created,
        Confirmed,
        Financed,
        Repaid,
        Claimed,
        Cancelled
    }

    struct Invoice {
        address supplier;
        address buyer;
        address settlementToken;
        address funder;
        uint128 faceValue;
        uint128 advanceAmount;
        uint128 repaymentAmount;
        uint64 dueDate;
        bytes32 metadataHash;
        bytes32 policyHash;
        Status status;
    }

    uint256 public nextInvoiceId = 1;
    mapping(uint256 invoiceId => Invoice invoice) public invoices;

    event InvoiceCreated(uint256 indexed invoiceId, address indexed supplier, address indexed buyer, address settlementToken);
    event InvoiceConfirmed(uint256 indexed invoiceId, address indexed buyer);
    event InvoiceFinanced(uint256 indexed invoiceId, address indexed funder, uint256 advanceAmount);
    event InvoiceRepaid(uint256 indexed invoiceId, address indexed buyer, uint256 repaymentAmount);
    event RepaymentClaimed(uint256 indexed invoiceId, address indexed funder, uint256 repaymentAmount);
    event InvoiceCancelled(uint256 indexed invoiceId);

    error InvalidAddress();
    error InvalidTerms();
    error InvalidState(Status expected, Status actual);
    error NotSupplier();
    error NotBuyer();
    error NotFunder();
    error TokenTransferFailed();
    error ReentrantCall();

    uint256 private unlocked = 1;
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        if (unlocked != 1) revert ReentrantCall();
        unlocked = 2;
    }

    function _nonReentrantAfter() private {
        unlocked = 1;
    }

    function createInvoice(
        address buyer,
        address settlementToken,
        uint128 faceValue,
        uint128 advanceAmount,
        uint128 repaymentAmount,
        uint64 dueDate,
        bytes32 metadataHash,
        bytes32 policyHash
    ) external returns (uint256 invoiceId) {
        if (buyer == address(0) || settlementToken == address(0)) revert InvalidAddress();
        if (
            faceValue == 0 || advanceAmount == 0 || repaymentAmount < advanceAmount ||
            repaymentAmount > faceValue || dueDate <= block.timestamp
        ) revert InvalidTerms();

        invoiceId = nextInvoiceId++;
        invoices[invoiceId] = Invoice({
            supplier: msg.sender,
            buyer: buyer,
            settlementToken: settlementToken,
            funder: address(0),
            faceValue: faceValue,
            advanceAmount: advanceAmount,
            repaymentAmount: repaymentAmount,
            dueDate: dueDate,
            metadataHash: metadataHash,
            policyHash: policyHash,
            status: Status.Created
        });
        emit InvoiceCreated(invoiceId, msg.sender, buyer, settlementToken);
    }

    function confirmInvoice(uint256 invoiceId) external {
        Invoice storage invoice = invoices[invoiceId];
        if (invoice.status != Status.Created) revert InvalidState(Status.Created, invoice.status);
        if (msg.sender != invoice.buyer) revert NotBuyer();
        invoice.status = Status.Confirmed;
        emit InvoiceConfirmed(invoiceId, msg.sender);
    }

    function financeInvoice(uint256 invoiceId) external nonReentrant {
        Invoice storage invoice = invoices[invoiceId];
        if (invoice.status != Status.Confirmed) revert InvalidState(Status.Confirmed, invoice.status);
        invoice.funder = msg.sender;
        invoice.status = Status.Financed;
        if (!IERC20(invoice.settlementToken).transferFrom(msg.sender, invoice.supplier, invoice.advanceAmount)) {
            revert TokenTransferFailed();
        }
        emit InvoiceFinanced(invoiceId, msg.sender, invoice.advanceAmount);
    }

    function repayInvoice(uint256 invoiceId) external nonReentrant {
        Invoice storage invoice = invoices[invoiceId];
        if (invoice.status != Status.Financed) revert InvalidState(Status.Financed, invoice.status);
        if (msg.sender != invoice.buyer) revert NotBuyer();
        invoice.status = Status.Repaid;
        if (!IERC20(invoice.settlementToken).transferFrom(msg.sender, address(this), invoice.repaymentAmount)) {
            revert TokenTransferFailed();
        }
        emit InvoiceRepaid(invoiceId, msg.sender, invoice.repaymentAmount);
    }

    function claimRepayment(uint256 invoiceId) external nonReentrant {
        Invoice storage invoice = invoices[invoiceId];
        if (invoice.status != Status.Repaid) revert InvalidState(Status.Repaid, invoice.status);
        if (msg.sender != invoice.funder) revert NotFunder();
        invoice.status = Status.Claimed;
        if (!IERC20(invoice.settlementToken).transfer(msg.sender, invoice.repaymentAmount)) revert TokenTransferFailed();
        emit RepaymentClaimed(invoiceId, msg.sender, invoice.repaymentAmount);
    }

    function cancelInvoice(uint256 invoiceId) external {
        Invoice storage invoice = invoices[invoiceId];
        if (invoice.status != Status.Created) revert InvalidState(Status.Created, invoice.status);
        if (msg.sender != invoice.supplier) revert NotSupplier();
        invoice.status = Status.Cancelled;
        emit InvoiceCancelled(invoiceId);
    }
}
