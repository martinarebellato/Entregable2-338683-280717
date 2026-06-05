import { ethers } from "ethers";
import type { Proposal } from "../types/Proposal";

interface ProposalListProps {
    proposals: Proposal[];
    threshold: bigint;
    isCurrentUserSigner: boolean;
    currentAccount: string;
    onApprove: (proposalId: number) => Promise<void>;
    onExecute: (proposalId: number) => Promise<void>;
    onCancel: (proposalId: number) => Promise<void>;
}

function getProposalStatus(proposal: Proposal): string {
    if (proposal.executed) {
        return "Ejecutada";
    }

    if (proposal.cancelled) {
        return "Cancelada";
    }

    return "Pendiente";
}

function ProposalList({
    proposals,
    threshold,
    isCurrentUserSigner,
    currentAccount,
    onApprove,
    onExecute,
    onCancel,
}: ProposalListProps) {
    return (
        <section className="card">
            <h2>Propuestas</h2>

            {proposals.length === 0 && <p>No hay propuestas creadas.</p>}

            {proposals.map((proposal) => {
                const isPending = !proposal.executed && !proposal.cancelled;
                const canApprove =
                    isCurrentUserSigner &&
                    isPending &&
                    !proposal.hasCurrentUserApproved;

                const canExecute =
                    isCurrentUserSigner &&
                    isPending &&
                    proposal.approvals >= threshold;

                const canCancel =
                    isCurrentUserSigner &&
                    isPending &&
                    currentAccount !== "" &&
                    proposal.proposer.toLowerCase() === currentAccount.toLowerCase();

                return (
                    <article className="proposal" key={proposal.id}>
                        <h3>Propuesta #{proposal.id}</h3>

                        <p>
                            <strong>Destino:</strong> {proposal.destination}
                        </p>

                        <p>
                            <strong>Valor:</strong>{" "}
                            {ethers.formatEther(proposal.value)} ETH
                        </p>

                        <p>
                            <strong>Aprobaciones:</strong>{" "}
                            {proposal.approvals.toString()} /{" "}
                            {threshold.toString()}
                        </p>

                        <p>
                            <strong>Estado:</strong>{" "}
                            {getProposalStatus(proposal)}
                        </p>

                        <div className="actions">
                            <button
                                disabled={!canApprove}
                                onClick={() => onApprove(proposal.id)}
                            >
                                Aprobar
                            </button>

                            <button
                                disabled={!canExecute}
                                onClick={() => onExecute(proposal.id)}
                            >
                                Ejecutar
                            </button>

                            <button
                                disabled={!canCancel}
                                onClick={() => onCancel(proposal.id)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}

export default ProposalList;