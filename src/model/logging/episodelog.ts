import { VoteType } from "./voteType";

export class EpisodeLog {
    public nominationsPreVeto: string[] = [];
    public vetoWinner?: string;
    public nominationsPostVeto: string[] = [];
    public evicted: number = -1;
    public votes: { [id: string]: VoteType } = {};
    public votesInMajority: number = -1;
}
