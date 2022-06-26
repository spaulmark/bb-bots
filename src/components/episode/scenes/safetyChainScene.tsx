import React from "react";
import { GameState, getById, Houseguest, nonEvictedHouseguests } from "../../../model";
import { GrayVote, PoVvote, SaveVote } from "../../../model/logging/voteType";
import { Centered, CenteredBold } from "../../layout/centered";
import { Portraits } from "../../playerPortrait/portraits";
import { Scene } from "./scene";
import { getWorstTarget } from "../../../utils/ai/aiApi";
import { listNames } from "../../../utils/listStrings";
import { generateHohCompScene } from "./hohCompScene";
import { generateEvictionScene } from "./evictionScene";

export function generateSafetyChainScene(initialGameState: GameState): [GameState, Scene] {
    const chainOrder: Houseguest[] = [];
    let [newGameState, HoHscene, HoHarray] = generateHohCompScene(initialGameState, {
        doubleEviction: true,
        customText:
            "Houseguests, please return to the living room. It is time for a Safety Chain Special Eviction.",
        skipHoHWin: true,
        bottomText: "has won the safety competition!",
    });
    const chainStarter: Houseguest = HoHarray[0];
    const options: Houseguest[] = nonEvictedHouseguests(newGameState).filter(
        (hg) => hg.id !== chainStarter.id
    );
    chainOrder.push(chainStarter);
    const safeSpots = newGameState.nonEvictedHouseguests.size - 3;
    let currentChooser: Houseguest = chainStarter;
    const sceneContent: JSX.Element[] = [];
    let first = true;
    while (chainOrder.length < safeSpots) {
        const newSafeIndex = options.indexOf(getWorstTarget(currentChooser, options, newGameState));
        chainOrder.push(options[newSafeIndex]);
        newGameState.currentLog.votes[currentChooser.id] = first
            ? new PoVvote(options[newSafeIndex].id)
            : new SaveVote(options[newSafeIndex].id);
        first = false;
        options.splice(newSafeIndex, 1);
        sceneContent.push(
            <Centered key={`safetychain-${newGameState.phase}-${chainOrder.length}`}>
                {currentChooser.name} has chosen {chainOrder[chainOrder.length - 1].name}!
            </Centered>,
            <Portraits
                houseguests={[currentChooser, chainOrder[chainOrder.length - 1]]}
                key={`safetychain-${newGameState.phase}-${chainOrder.length}-2`}
                centered={true}
            />
        );
        currentChooser = chainOrder[chainOrder.length - 1];
    }
    newGameState.currentLog.votes[currentChooser.id] = new SaveVote(-1, "Not eligible");

    const leftOut = options.slice(0, 3);

    leftOut.forEach((hg) => (newGameState.currentLog.votes[hg.id] = new GrayVote("Not eligible")));
    newGameState.currentLog.customEvictedText = "not selected for safety";
    newGameState.currentLog.customEvicted = leftOut.map((hg) => hg.id);

    sceneContent.push(
        <CenteredBold key={`safetychain-final-${newGameState.phase}-${chainOrder.length}`}>
            {listNames(leftOut.map((h) => h.name))} compete in a second safety competition.
        </CenteredBold>,
        <Portraits
            houseguests={leftOut}
            centered={true}
            key={`safetychain-final-${newGameState.phase}-${chainOrder.length}-2`}
        />
    );
    let safetyComp2scene;
    let safeHg: Houseguest[];
    [newGameState, safetyComp2scene, safeHg] = generateHohCompScene(newGameState, {
        doubleEviction: true,
        competitors: leftOut,
        customText: ``,
        skipHoHWin: true,
        bottomText: "has won the safety competition!",
    });

    newGameState.incrementLogIndex();
    const noms = leftOut.filter((hg) => hg.id !== safeHg[0].id).map((hg) => getById(newGameState, hg.id));

    newGameState.currentLog.nominationsPostVeto = noms.map((n) => n.name);
    let evictionScene;
    noms.forEach((nom) => nom.nominations++);
    [newGameState, evictionScene] = generateEvictionScene(newGameState, [], noms, {
        votingTo: "Evict",
        doubleEviction: true,
        tieBreaker: {
            hg: chainStarter,
            text: "Safety Competition winner",
            voteType: (id) => new PoVvote(id),
        },
    });

    const scene: Scene = new Scene({
        title: "Chain Ceremony",
        gameState: initialGameState,
        content: (
            <div>
                {HoHscene.content}
                {sceneContent}
                <div style={{ marginTop: 50 }}>
                    <Centered> ...</Centered>
                </div>
                {safetyComp2scene.content}
                {evictionScene.content}
            </div>
        ),
    });
    return [newGameState, scene];
}
