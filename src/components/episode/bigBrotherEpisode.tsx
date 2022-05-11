import { GameState, Houseguest, EpisodeType, Episode } from "../../model";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateNomCeremonyScene } from "./scenes/nomCeremonyScene";
import { generateVetoCompScene } from "./scenes/vetoCompScene";
import { generateVetoCeremonyScene } from "./scenes/vetoCeremonyScene";
import { generateEvictionScene } from "./scenes/evictionScene";
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
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "BigBrotherVanilla",
    generate: generateBbVanilla,
};

const TabItem = styled.li`
    cursor: pointer;
`;

// Refactoring ideas
/**
 * Might be best to start passing ids instead of houseguests for HoH/nominees/veto winner
 */

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
    const episode = generateBBVanillaScenes(initialGamestate, GoldenVeto);
    return new Episode({
        title: episode.title,
        scenes: episode.scenes,
        gameState: new GameState(episode.gameState),
        initialGamestate,
        type: BigBrotherVanilla,
    });
}

export function generateBBVanillaScenes(
    initialGamestate: GameState,
    veto: Veto | null,
    doubleEviction: boolean = false
): {
    gameState: GameState;
    scenes: Scene[];
    title: string;
} {
    let hoh: Houseguest;
    let currentGameState: GameState;
    let hohCompScene: Scene;
    const scenes: Scene[] = [];

    [currentGameState, hohCompScene, hoh] = generateHohCompScene(initialGamestate, { doubleEviction });
    scenes.push(hohCompScene);

    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(currentGameState, hoh, {
        doubleEviction,
    });
    scenes.push(nomCeremonyScene);

    if (veto) {
        let vetoCompScene;
        let povWinner: Houseguest;
        [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(
            currentGameState,
            hoh,
            nominees,
            veto,
            doubleEviction
        );
        scenes.push(vetoCompScene);
        let vetoCeremonyScene;

        [currentGameState, vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
            currentGameState,
            hoh,
            nominees,
            povWinner,
            { doubleEviction, finalNominees: 2 }
        );
        scenes.push(vetoCeremonyScene);
    }
    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(currentGameState, hoh, nominees, {
        doubleEviction,
        votingTo: "Evict",
    });
    if (veto === null) {
        currentGameState.currentLog.nominationsPostVeto = currentGameState.currentLog.nominationsPreVeto;
    }
    scenes.push(evictionScene);
    const title = `Week ${currentGameState.phase}`;
    return { gameState: currentGameState, scenes, title };
}
