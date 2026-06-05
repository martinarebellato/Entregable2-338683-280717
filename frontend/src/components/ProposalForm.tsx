import { useState } from "react";

interface ProposalFormProps {
    isCurrentUserSigner: boolean;
    onCreateProposal: (
        destination: string,
        valueInEth: string,
        data: string
    ) => Promise<void>;
}

function ProposalForm({
    isCurrentUserSigner,
    onCreateProposal,
}: ProposalFormProps) {
    const [destination, setDestination] = useState("");
    const [valueInEth, setValueInEth] = useState("0");
    const [data, setData] = useState("0x");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isCurrentUserSigner) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onCreateProposal(destination, valueInEth, data);
            setDestination("");
            setValueInEth("0");
            setData("0x");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="card">
            <h2>Nueva propuesta</h2>

            <form onSubmit={handleSubmit}>
                <label>Dirección destino</label>
                <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="0x..."
                    required
                />

                <label>Valor en ETH</label>
                <input
                    value={valueInEth}
                    onChange={(event) => setValueInEth(event.target.value)}
                    placeholder="0"
                    required
                />

                <label>Calldata</label>
                <input
                    value={data}
                    onChange={(event) => setData(event.target.value)}
                    placeholder="0x"
                    required
                />

                <button
                    type="submit"
                    disabled={!isCurrentUserSigner || isSubmitting}
                >
                    {isSubmitting ? "Creando..." : "Crear propuesta"}
                </button>
            </form>
        </section>
    );
}

export default ProposalForm;