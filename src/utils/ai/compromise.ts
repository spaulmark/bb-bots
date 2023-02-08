import { Houseguest } from "../../model";
import { Intent } from "./generateExcuse";
import { HitListEntry } from "./hitList";

// if you are in options, never vote yourself, everyone else is an option first /
// if you are not in options, never vote your least desired choice. /

interface TargetsToVoters {
    [id: number]: Set<number>;
}

export function compromiseVote(
    voters: Houseguest[],
    targets: Houseguest[],
    tiebreaker: Houseguest | undefined,
    intent: Intent
): TargetsToVoters {
    const canVoteSelf = false; // FIXME: make this a param
    // if hoh, add hoh as a half weight vote
    const hohId: number = tiebreaker ? tiebreaker.id : -1;
    if (tiebreaker) {
        voters.push(tiebreaker); // TODO: wrong because he could already be a voter, like the veto winner in co-hoh.
        // also change the tiebreaker thing to only like... vote for their first choice?!?! in the tie situation? wtf... man..
    }
    const majority = Math.ceil(voters.length / 2);

    // filter the voters hit lists to only include targets
    const targetIdSet = new Set(targets.map((target) => target.id));

    // we don't want it to be an array, we want it to be a map of id to hitlistentry
    const filteredHitLists: { [id: number]: HitListEntry[] } = {};
    voters.forEach((voter) => {
        filteredHitLists[voter.id] = voter.hitList.filter((hit) => targetIdSet.has(hit.id));
    });

    // hit lists are sorted from bad -> good by default. if intent === good, reverse all hitlists
    for (const hitList of Object.values(filteredHitLists)) {
        if (intent === "good") {
            hitList.reverse();
        }
    }
    // target: people who are willing to vote for them //
    const currentVotes: TargetsToVoters = {};
    for (const target of targets) {
        currentVotes[target.id] = new Set();
    }
    // FIXME: allowed to vote for self Y/N, won't come up in big brother but will in camp director.
    // you need to add it here, before the initial vote.
    // if you are allowed to vote for yourself, push yourself to the hit list. //

    // TODO: nominees are allowed to vote in big brother australia...!

    // first everyone votes for their first choice, also set up amt compromised
    const record: { [id: number]: { amountCompromised: number; indexCompromised: number } } = {};
    const distanceToNextCompromise: { [id: number]: number } = {};

    const getDistanceToNextCompromise = (voterId: number): number => {
        const i = record[voterId].indexCompromised;
        // if you are in targets, and intent = bad, and you cannot vote for yourself, you CAN vote the last person in your list, otherwise you can't
        const canVoteLast = targetIdSet.has(voterId) && intent === "bad" && !canVoteSelf;
        // if i is out of range of the array or is the last person in the array and you can't vote for them, return infinity
        if (
            i + 1 >= filteredHitLists[voterId].length ||
            (i + 1 === filteredHitLists[voterId].length - 1 && !canVoteLast)
        ) {
            return Infinity;
        }
        return Math.abs(filteredHitLists[voterId][i].value - filteredHitLists[voterId][i + 1].value);
    };

    for (const voter of voters) {
        record[voter.id] = { amountCompromised: 0, indexCompromised: 0 };
        const target = filteredHitLists[voter.id][0];
        currentVotes[target.id].add(voter.id);
        distanceToNextCompromise[voter.id] = getDistanceToNextCompromise(voter.id);
    }
    const checkForMajority = () => {
        for (const target of targets) {
            let size = currentVotes[target.id].size;
            if (currentVotes[target.id].has(hohId)) {
                size -= 0.5;
            }
            if (size >= majority) {
                return true;
            }
        }
        return false;
    };
    // check if there is a majority (include hoh tiebreaker if aplicable)
    if (checkForMajority()) {
        return currentVotes; // return where everyone is voting
    }

    // then start compromising one by one until a majority is reached
    while (!checkForMajority()) {
        // get the id of whoever has the smallest distance to next compromise
        const compromiser = parseInt(
            Object.keys(distanceToNextCompromise).reduce((minId, id) => {
                const realMinId = parseInt(minId);
                const realId = parseInt(id);
                return distanceToNextCompromise[realMinId] + record[realMinId].amountCompromised <
                    distanceToNextCompromise[realId] + record[realId].amountCompromised
                    ? minId
                    : id;
            })
        );
        if (distanceToNextCompromise[compromiser] === Infinity) {
            break;
        }
        record[compromiser].amountCompromised += distanceToNextCompromise[compromiser];
        const nextIndex = record[compromiser].indexCompromised + 1;
        const nextTarget = filteredHitLists[compromiser][nextIndex]; // TODO: apparently this can be undefined
        currentVotes[nextTarget.id].add(compromiser);
        record[compromiser].indexCompromised = nextIndex;
    }

    // TODO: this is wrong, you need to map 1:1 voters to votes, make a collapse votes function.
    const readableResult: any = {};
    const idToName = (id: number): string => {
        return (
            voters.find((voter) => voter.id === id)?.name ||
            targets.find((target) => target.id === id)?.name ||
            "ERROR"
        );
    };
    for (const [targetId, voters] of Object.entries(currentVotes)) {
        readableResult[idToName(parseInt(targetId))] = [...voters].map(idToName);
    }
    console.log(readableResult);
    return currentVotes;
}
