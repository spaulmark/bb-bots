import { VoteType } from "./voteType";

export class EpisodeLog {
    public nominationsPreVeto: number[] = [];
    public vetoWinner: number = -1;
    public nominationsPostVeto: number[] = [];
    public evicted: number = -1;
    public votes: { [id: string]: VoteType } = {};
}
