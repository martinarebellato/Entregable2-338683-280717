import { useEffect, useState } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import multisigArtifact from "./abi/Multisig.json";
import ContractInfo from "./components/ContractInfo";
import ProposalForm from "./components/ProposalForm";
import ProposalList from "./components/ProposalList";
import {
  MULTISIG_CONTRACT_ADDRESS,
  SEPOLIA_CHAIN_ID,
} from "./config/contract";
import type { Proposal } from "./types/Proposal";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<Contract | null>(null);
  const [signers, setSigners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<bigint>(0n);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isCurrentUserSigner, setIsCurrentUserSigner] = useState(false);
  const [message, setMessage] = useState("");

  const abi = "abi" in multisigArtifact ? multisigArtifact.abi : multisigArtifact;

  async function ensureSepoliaNetwork() {
    if (!window.ethereum) {
      throw new Error("MetaMask no está instalado.");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error: unknown) {
      const metamaskError = error as { code?: number };

      if (metamaskError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });

        return;
      }

      throw error;
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setMessage("Necesitás instalar MetaMask.");
      return;
    }

    try {
      await ensureSepoliaNetwork();

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts.length === 0) {
        setMessage("No se encontró ninguna cuenta conectada.");
        return;
      }

      const selectedAccount = accounts[0];
      setAccount(selectedAccount);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const multisigContract = new Contract(
        MULTISIG_CONTRACT_ADDRESS,
        abi,
        signer
      );

      setContract(multisigContract);
      setMessage("");
      await loadContractData(multisigContract, selectedAccount);
    } catch (error) {
      console.error(error);
      setMessage("No se pudo conectar la wallet.");
    }
  }

  async function loadContractData(multisigContract: Contract, user: string) {
    const contractSigners = (await multisigContract.getSigners()) as string[];
    const contractThreshold = (await multisigContract.threshold()) as bigint;
    const proposalCount = (await multisigContract.proposalCount()) as bigint;
    const userIsSigner = (await multisigContract.isSigner(user)) as boolean;

    const loadedProposals: Proposal[] = [];

    for (let i = 0; i < Number(proposalCount); i++) {
      const proposal = await multisigContract.getProposal(i);

      const hasCurrentUserApproved =
        user !== ""
          ? ((await multisigContract.hasSignerApproved(i, user)) as boolean)
          : false;

      loadedProposals.push({
        id: i,
        proposer: proposal[0],
        destination: proposal[1],
        value: proposal[2],
        data: proposal[3],
        approvals: proposal[4],
        executed: proposal[5],
        cancelled: proposal[6],
        hasCurrentUserApproved,
      });
    }

    setSigners(contractSigners);
    setThreshold(contractThreshold);
    setIsCurrentUserSigner(userIsSigner);
    setProposals(loadedProposals);
  }

  async function refreshData() {
    if (!contract || !account) {
      return;
    }

    await loadContractData(contract, account);
  }

  function resetWalletState(messageToShow: string) {
    setAccount("");
    setContract(null);
    setSigners([]);
    setThreshold(0n);
    setProposals([]);
    setIsCurrentUserSigner(false);
    setMessage(messageToShow);
  }

  async function createProposal(
    destination: string,
    valueInEth: string,
    data: string
  ) {
    if (!contract) {
      setMessage("Primero conectá la wallet.");
      return;
    }

    try {
      setMessage("Creando propuesta...");

      const formattedData = data.trim() === "" ? "0x" : data.trim();
      const value = ethers.parseEther(valueInEth);

      const transaction = await contract.createProposal(
        destination,
        value,
        formattedData
      );

      await transaction.wait();

      setMessage("Propuesta creada correctamente.");
      await refreshData();
    } catch (error) {
      console.error(error);
      setMessage("No se pudo crear la propuesta.");
    }
  }

  async function approveProposal(proposalId: number) {
    if (!contract) {
      setMessage("Primero conectá la wallet.");
      return;
    }

    try {
      setMessage("Aprobando propuesta...");

      const transaction = await contract.approveProposal(proposalId);

      await transaction.wait();

      setMessage("Propuesta aprobada correctamente.");
      await refreshData();
    } catch (error) {
      console.error(error);
      setMessage("No se pudo aprobar la propuesta.");
    }
  }

  async function executeProposal(proposalId: number) {
    if (!contract) {
      setMessage("Primero conectá la wallet.");
      return;
    }

    try {
      setMessage("Ejecutando propuesta...");

      const transaction = await contract.executeProposal(proposalId);

      await transaction.wait();

      setMessage("Propuesta ejecutada correctamente.");
      await refreshData();
    } catch (error) {
      console.error(error);
      setMessage("No se pudo ejecutar la propuesta.");
    }
  }

  async function cancelProposal(proposalId: number) {
    if (!contract) {
      setMessage("Primero conectá la wallet.");
      return;
    }

    try {
      setMessage("Cancelando propuesta...");

      const transaction = await contract.cancelProposal(proposalId);

      await transaction.wait();

      setMessage("Propuesta cancelada correctamente.");
      await refreshData();
    } catch (error) {
      console.error(error);
      setMessage("No se pudo cancelar la propuesta.");
    }
  }

  useEffect(() => {
    const ethereum = window.ethereum;

    if (!ethereum || !ethereum.on) {
      return;
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];

      if (!accounts || accounts.length === 0) {
        resetWalletState("Wallet desconectada.");
        return;
      }

      connectWallet();
    };

    const handleChainChanged = () => {
      connectWallet();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  return (
    <main className="container">
      <h1>Multisig Wallet</h1>

      <button onClick={connectWallet}>
        {account ? "Wallet conectada" : "Conectar MetaMask"}
      </button>

      {message && <p className="message">{message}</p>}

      <ContractInfo
        contractAddress={MULTISIG_CONTRACT_ADDRESS}
        account={account}
        signers={signers}
        threshold={threshold}
        isCurrentUserSigner={isCurrentUserSigner}
      />

      <ProposalForm
        isCurrentUserSigner={isCurrentUserSigner}
        onCreateProposal={createProposal}
      />

      <ProposalList
        proposals={proposals}
        threshold={threshold}
        isCurrentUserSigner={isCurrentUserSigner}
        currentAccount={account}
        onApprove={approveProposal}
        onExecute={executeProposal}
        onCancel={cancelProposal}
      />
    </main>
  );
}

export default App;