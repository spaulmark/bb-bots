import { GameState, Houseguest, EpisodeType, Episode, nonEvictedHousguestsSplit } from "../../model";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateNomCeremonyScene } from "./scenes/nomCeremonyScene";
import { generateVetoCompScene } from "./scenes/vetoCompScene";
import { generateVetoCeremonyScene } from "./scenes/vetoCeremonyScene";
import { TieBreaker, generateEvictionScene } from "./scenes/evictionScene";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Scene } from "./scenes/scene";
import { HasText } from "../layout/text";
import styled from "styled-components";
import { weekStartTab$ } from "../../subjects/subjects";
import { WeekStartWrapper } from "./bigBrotherWeekstartWrapper";
import { GoldenVeto, Veto } from "./veto/veto";

export const BigBrotherVanilla: EpisodeType = {
    canPlayWith: (n: number) => {
        return n > 3;
    },
    eliminates: 1,
    name: "",
    emoji: "",
    description: "",
    generate: generateBbVanilla,
};

const TabItem = styled.li`
    cursor: pointer;
`;

function Tab(props: { text: string; active: number; id: number; setActive: any }): JSX.Element {
    return (
        <TabItem
            className={props.active === props.id ? "is-active" : ""}
            onClick={() => {
                props.setActive(props.id);
                weekStartTab$.next(props.id);
            }}
        >
            <a>{props.text}</a>
        </TabItem>
    );
}

export function Tabs(): JSX.Element {
    const [active, setActive] = React.useState(weekStartTab$.value);
    return (
        <div className="tabs is-centered is-fullwidth is-medium" style={{ marginBottom: 0 }}>
            <ul style={{ paddingLeft: 0 }}>
                <Tab text={"Memory Wall"} active={active} setActive={setActive} id={0} />
                <Tab text={"Alliances"} active={active} setActive={setActive} id={1} />
            </ul>
        </div>
    );
}

export function defaultContent(initialGameState: GameState) {
    return (
        <HasText>
            <Tabs />
            <WeekStartWrapper gameState={initialGameState} />
            <br />
            <NextEpisodeButton />
        </HasText>
    );
}

export function generateBbVanilla(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, { veto: GoldenVeto });
    return new Episode({
        scenes: episode.scenes,
        gameState: new GameState(episode.gameState),
        initialGamestate,
        type: BigBrotherVanilla,
    });
}

interface BBVanillaOptions {
    doubleEviction?: boolean;
    veto: Veto | null;
    splitIndex?: number;
    nomineesCanVote?: boolean;
    thirdNominee?: boolean;
    previousHoHcanCompete?: boolean;
    coHoH?: boolean;
    coHohIsFinal?: boolean;
    votingTo?: "Evict" | "Save";
    hohCompCustomText?: string;
    tieBreaker?: (hg: Houseguest | undefined) => TieBreaker | undefined; // kind of a hack, might need to be updated later
}

export function generateBBVanillaScenes(
    initialGamestate: GameState,
    options: BBVanillaOptions
): {
    gameState: GameState;
    scenes: Scene[];
} {
    let hohArray: Houseguest[];
    let currentGameState: GameState;
    let hohCompScene: Scene;
    const scenes: Scene[] = [];
    const doubleEviction = !!options.doubleEviction;
    const splitIndex = options.splitIndex;

    [currentGameState, hohCompScene, hohArray] = generateHohCompScene(initialGamestate, {
        doubleEviction,
        splitIndex,
        previousHoHcanCompete: options.previousHoHcanCompete,
        coHoH: options.coHoH,
        coHohIsFinal: options.coHohIsFinal,
        customText: options.hohCompCustomText,
    });
    scenes.push(hohCompScene);

    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(currentGameState, hohArray, {
        doubleEviction,
        splitIndex,
        thirdNominee: options.thirdNominee,
    });
    scenes.push(nomCeremonyScene);

    return generateVetoScenesOnwards(currentGameState, hohArray, nominees, scenes, [], options);
}
export function generateVetoScenesOnwards(
    currentGameState: GameState,
    hohArray: Houseguest[],
    nominees: Houseguest[],
    scenes: Scene[],
    immuneHgs: Houseguest[],
    options: BBVanillaOptions
) {
    const splitIndex: number | undefined = options.splitIndex;
    const veto: Veto | null = options.veto;
    const doubleEviction: boolean = !!options.doubleEviction;
    let povWinner: Houseguest | undefined = undefined;
    // force no veto if 3 or less houseguests are participating in the episode
    const lessThan3hgs = nonEvictedHousguestsSplit(splitIndex, currentGameState).length <= 3;
    if (veto && !lessThan3hgs) {
        let vetoCompScene;
        [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(
            currentGameState,
            hohArray,
            nominees,
            { veto, doubleEviction, splitIndex }
        );
        scenes.push(vetoCompScene);
        let vetoCeremonyScene;

        [currentGameState, vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
            currentGameState,
            hohArray,
            nominees,
            povWinner,
            { doubleEviction, veto, immuneHgs, splitIndex }
        );
        scenes.push(vetoCeremonyScene);
    }
    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(currentGameState, hohArray, nominees, {
        doubleEviction,
        votingTo: options.votingTo || "Evict",
        splitIndex,
        nomineesCanVote: options.nomineesCanVote,
        tieBreaker: options.tieBreaker && options.tieBreaker(povWinner),
    });

    scenes.push(evictionScene);
    return { gameState: currentGameState, scenes };
}
