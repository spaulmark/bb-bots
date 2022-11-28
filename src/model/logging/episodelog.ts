import { VoteType } from "./voteType";

export class EpisodeLog {
    public nominationsPreVeto: string[] = [];
    public vetoWinner?: string;
    public winner?: number;
    public runnerUp?: number;
    public evicted: number[] = [];
    public customEvicted: number[] = [];
    public customEvictedText: string = "";
    public votes: { [id: string]: VoteType } = {};
    public votesInMajority: number = -1;
    public outOf: number = -1;
    public soleVoter?: string;
    public votingTo?: string;
    public pseudo?: boolean = false;
    public vetoEmoji?: string;
    public weekEmoji?: string;
    public strikethroughNominees: string[] = [];
}

export function hasLogBeenModified(log: EpisodeLog): boolean {
    return (
        log.nominationsPreVeto.length > 0 ||
        log.evicted.length > 0 ||
        log.customEvicted.length > 0 ||
        log.customEvictedText.length > 0 ||
        Object.keys(log.votes).length > 0 ||
        log.votesInMajority !== -1 ||
        log.outOf !== -1 ||
        log.soleVoter !== undefined ||
        log.votingTo !== undefined ||
        !!log.pseudo
    );
}
