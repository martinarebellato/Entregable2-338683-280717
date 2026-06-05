interface ContractInfoProps {
    contractAddress: string;
    account: string;
    signers: string[];
    threshold: bigint;
    isCurrentUserSigner: boolean;
}

function ContractInfo({
    contractAddress,
    account,
    signers,
    threshold,
    isCurrentUserSigner,
}: ContractInfoProps) {
    return (
        <section className="card">
            <h2>Información del contrato</h2>

            <p>
                <strong>Contrato:</strong> {contractAddress}
            </p>

            <p>
                <strong>Wallet conectada:</strong>{" "}
                {account ? account : "No conectada"}
            </p>

            {account && !isCurrentUserSigner && (
                <p className="warning">
                    La wallet conectada no es signer. Puede consultar el
                    contrato, pero no puede crear, aprobar ni ejecutar
                    propuestas.
                </p>
            )}

            {account && isCurrentUserSigner && (
                <p className="success">
                    La wallet conectada es signer del contrato.
                </p>
            )}

            <p>
                <strong>Threshold:</strong> {threshold.toString()}
            </p>

            <h3>Signers</h3>
            <ul>
                {signers.map((signer) => (
                    <li key={signer}>{signer}</li>
                ))}
            </ul>
        </section>
    );
}

export default ContractInfo;