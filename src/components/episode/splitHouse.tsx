import { GameState, MutableGameState } from "../../model";
import { defaultContent, generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Episode, EpisodeType, nonEvictedHousguestsSplit, Split } from "./episodes";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";
import { shuffle } from "lodash";
import _ from "lodash";
import { BlankVote } from "../../model/logging/voteType";

export const SplitHouse: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 2,
    arrowsEnabled: true,
    emoji: "↔️",
    hasViewsbar: true,
    name: "Split House",
    description:
        "Houseguests are divided into two groups, and each group plays a round of Big Brother, isolated from the others.",
    splitFunction: splitHouseRandomly(["Indoors", "Outdoors"]),
    generate,
};

export const PersistentSplitHouse: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 2,
    arrowsEnabled: true,
    emoji: "↔️*",
    hasViewsbar: true,
    name: "Persistent Split House",
    description: "A split house that uses the same split as the last week.",
    splitFunction: useLastSplit,
    generate,
};

function generate(initialGamestate: GameState): Episode {
    let currentGameState = new MutableGameState(initialGamestate);
    const scenes: Scene[] = [];
    const split0 = generateBBVanillaScenes(currentGameState, {
        veto: GoldenVeto,
        splitIndex: 0,
    });
    currentGameState = split0.gameState;
    const split0prevHoH = _.cloneDeep(split0.gameState.previousHOH);
    currentGameState.previousHOH = _.cloneDeep(initialGamestate.previousHOH) || [];
    split0.scenes.forEach((scene) => scenes.push(scene));
    nonEvictedHousguestsSplit(1, currentGameState).forEach((hg) => {
        currentGameState.currentLog.votes[hg.id] = new BlankVote();
    });
    currentGameState.incrementLogIndex();
    nonEvictedHousguestsSplit(0, currentGameState).forEach((hg) => {
        currentGameState.currentLog.votes[hg.id] = new BlankVote();
    });

    const intermissionScene = new Scene({
        title: "[Outdoors]",
        content: defaultContent(currentGameState),
        gameState: currentGameState,
    });
    scenes.push(intermissionScene);

    const split1 = generateBBVanillaScenes(currentGameState, {
        veto: GoldenVeto,
        splitIndex: 1,
    });
    currentGameState = split1.gameState;
    split1.scenes.forEach((scene) => scenes.push(scene));
    split0prevHoH && currentGameState.previousHOH?.push(...split0prevHoH);
    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        scenes,
        type: SplitHouse,
    });
}

function useLastSplit(gameState: GameState): Split[] {
    return gameState.split.length > 0
        ? gameState.split
        : splitHouseRandomly(["Indoors", "Outdoors"])(gameState);
}

function splitHouseRandomly(names: string[]): (gameState: GameState) => Split[] {
    return (currentGameState: GameState) => {
        const nonEvictedHouseguests: number[] = shuffle(Array.from(currentGameState.nonEvictedHouseguests));
        const members: Set<number>[] = [];
        for (let i = 0; i < names.length; i++) {
            members.push(new Set<number>());
        }
        nonEvictedHouseguests.forEach((hgid, i) => {
            members[i % names.length].add(hgid);
        });
        const result: Split[] = members.map((members, i) => ({
            name: names[i],
            members,
        }));
        return result;
    };
}
