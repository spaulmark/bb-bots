import { GameState, MutableGameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Episode, EpisodeType, Split } from "./episodes";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";
import { shuffle } from "lodash";
import _ from "lodash";

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
    // TODO: i think the HGs not in the current split need [blank votes] //
    currentGameState.incrementLogIndex();
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
