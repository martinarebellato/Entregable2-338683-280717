// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "./Multisig.sol";

contract SignerProxy {
    function approveProposal(Multisig multisig, uint256 proposalId) external {
        multisig.approveProposal(proposalId);
    }
}

contract NonSignerProxy {
    function approveProposal(Multisig multisig, uint256 proposalId) external {
        multisig.approveProposal(proposalId);
    }
}