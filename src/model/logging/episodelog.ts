import { VoteType } from "./voteType";

export class EpisodeLog {
    public nominationsPreVeto: string[] = [];
    public vetoWinner?: string;
    public winner?: number;
    public runnerUp?: number;
    public nominationsPostVeto: string[] = [];
    public evicted: number[] = [];
    public votes: { [id: string]: VoteType } = {};
    public votesInMajority: number = -1;
    public outOf: number = -1;
    public soleVoter?: string;
    public votingTo?: string;
}
