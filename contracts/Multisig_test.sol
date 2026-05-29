// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "remix_tests.sol";
import "./Multisig.sol";
import "./MultisigTestHelpers.sol";
contract MultisigTest {
    receive() external payable {}

    function createMultisig(uint256 initialThreshold)
        internal
        returns (Multisig multisig, SignerProxy signerProxy)
    {
        signerProxy = new SignerProxy();

        address[] memory initialSigners = new address[](2);
        initialSigners[0] = address(this);
        initialSigners[1] = address(signerProxy);

        multisig = new Multisig(initialSigners, initialThreshold);
    }

    function shouldCreateProposal() public {
        (Multisig multisig, ) = createMultisig(2);

        multisig.createProposal(address(this), 0, "");

        Assert.equal(
            multisig.proposalCount(),
            1,
            "Proposal count should be 1"
        );

        (
            address proposer,
            address destination,
            uint256 value,
            ,
            uint256 approvals,
            bool executed,
            bool cancelled
        ) = multisig.getProposal(0);

        Assert.equal(
            proposer,
            address(this),
            "Proposer should be the test contract"
        );

        Assert.equal(
            destination,
            address(this),
            "Destination should be the test contract"
        );

        Assert.equal(value, 0, "Value should be 0");
        Assert.equal(approvals, 0, "Approvals should start at 0");
        Assert.equal(executed, false, "Proposal should not be executed");
        Assert.equal(cancelled, false, "Proposal should not be cancelled");
    }

    function shouldApproveProposal() public {
        (Multisig multisig, ) = createMultisig(2);

        multisig.createProposal(address(this), 0, "");
        multisig.approveProposal(0);

        (
            ,
            ,
            ,
            ,
            uint256 approvals,
            ,
            
        ) = multisig.getProposal(0);

        Assert.equal(approvals, 1, "Approvals should be 1");
        Assert.equal(
            multisig.hasSignerApproved(0, address(this)),
            true,
            "Signer should have approved"
        );
    }

    function shouldExecuteProposal() public {
        (Multisig multisig, SignerProxy signerProxy) = createMultisig(2);

        multisig.createProposal(address(this), 0, "");
        multisig.approveProposal(0);
        signerProxy.approveProposal(multisig, 0);

        multisig.executeProposal(0);

        (
            ,
            ,
            ,
            ,
            uint256 approvals,
            bool executed,
            bool cancelled
        ) = multisig.getProposal(0);

        Assert.equal(approvals, 2, "Approvals should be 2");
        Assert.equal(executed, true, "Proposal should be executed");
        Assert.equal(cancelled, false, "Proposal should not be cancelled");
    }

    function shouldRejectDuplicateApproval() public {
        (Multisig multisig, ) = createMultisig(2);

        multisig.createProposal(address(this), 0, "");
        multisig.approveProposal(0);

        try multisig.approveProposal(0) {
            Assert.ok(false, "Duplicate approval should fail");
        } catch {
            Assert.ok(true, "Duplicate approval was rejected");
        }
    }

    function shouldRejectNonSignerApproval() public {
        (Multisig multisig, ) = createMultisig(2);
        NonSignerProxy nonSignerProxy = new NonSignerProxy();

        multisig.createProposal(address(this), 0, "");

        try nonSignerProxy.approveProposal(multisig, 0) {
            Assert.ok(false, "Non signer approval should fail");
        } catch {
            Assert.ok(true, "Non signer approval was rejected");
        }
    }
}