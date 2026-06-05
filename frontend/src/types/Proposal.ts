export interface Proposal {
    id: number;
    proposer: string;
    destination: string;
    value: bigint;
    data: string;
    approvals: bigint;
    executed: boolean;
    cancelled: boolean;
    hasCurrentUserApproved: boolean;
}