import { GameState, Houseguest, EpisodeType, Episode, InitEpisode } from "../../model";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateNomCeremonyScene } from "./scenes/nomCeremonyScene";
import { generateVetoCompScene } from "./scenes/vetoCompScene";
import { generateVetoCeremonyScene } from "./scenes/vetoCeremonyScene";
import { generateEvictionScene } from "./scenes/evictionScene";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Scene } from "./scene";
import { HasText } from "../layout/text";
import styled from "styled-components";
import { weekStartTab$ } from "../../subjects/subjects";
import { WeekStartWrapper } from "./bigBrotherWeekstartWrapper";

export const BigBrotherVanilla: EpisodeType = {
    canPlayWith: (n: number) => {
        return n > 1;
    },
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "BigBrotherVanilla",
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

export function generateBbVanilla(initialGamestate: GameState): BigBrotherVanillaEpisode {
    const episode = generateBBVanillaScenes(initialGamestate);
    const content = (
        <HasText>
            <Tabs />
            <WeekStartWrapper gameState={initialGamestate} />
            <br />
            <NextEpisodeButton />
        </HasText>
    );
    return new BigBrotherVanillaEpisode({
        title: episode.title,
        scenes: episode.scenes,
        content,
        gameState: new GameState(episode.gameState),
        initialGamestate,
        type: BigBrotherVanilla,
    });
}
export class BigBrotherVanillaEpisode extends Episode {
    readonly title: string;
    readonly scenes: Scene[];
    readonly content: JSX.Element;
    readonly initialGamestate: GameState;
    readonly gameState: GameState;
    readonly type = BigBrotherVanilla;

    public constructor(init: InitEpisode) {
        super(init);
        this.title = init.title;
        this.scenes = init.scenes;
        this.content = init.content;
        this.gameState = init.gameState;
        this.initialGamestate = init.initialGamestate || init.gameState;
    }
}
export function generateBBVanillaScenes(
    initialGamestate: GameState,
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

    [currentGameState, hohCompScene, hoh] = generateHohCompScene(initialGamestate, doubleEviction);
    scenes.push(hohCompScene);

    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(
        currentGameState,
        hoh,
        doubleEviction
    );
    scenes.push(nomCeremonyScene);

    let vetoCompScene;
    let povWinner: Houseguest;
    [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(
        currentGameState,
        hoh,
        nominees[0],
        nominees[1],
        doubleEviction
    );
    scenes.push(vetoCompScene);
    let vetoCeremonyScene;

    [currentGameState, vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
        currentGameState,
        hoh,
        nominees,
        povWinner,
        doubleEviction
    );
    scenes.push(vetoCeremonyScene);

    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(
        currentGameState,
        hoh,
        nominees,
        doubleEviction
    );
    scenes.push(evictionScene);
    const title = `Week ${currentGameState.phase}`;
    return { gameState: currentGameState, scenes, title };
}
