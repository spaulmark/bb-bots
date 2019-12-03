import { GameState, Houseguest, getById, exclude } from "../../../model";
import { Scene } from "../scene";
import { useGoldenVeto, nominateNPlayers } from "../../../utils/ai/aiApi";
import { Portraits, Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";

export function generateVetoCeremonyScene(
    initialGameState: GameState,
    HoH: Houseguest,
    initialNominees: Houseguest[],
    povWinner: Houseguest
): [Scene, Houseguest[]] {
    let povTarget: Houseguest | null = null;
    let descisionText = "";
    initialNominees[0] = getById(initialGameState, initialNominees[0].id);
    initialNominees[1] = getById(initialGameState, initialNominees[1].id);
    HoH = getById(initialGameState, HoH.id);
    const vetoChoice = useGoldenVeto(povWinner, initialNominees, initialGameState);
    povTarget = vetoChoice.decision;
    if (!povTarget) {
        descisionText += "... not to use the power of veto.";
    } else if (povWinner.id == initialNominees[0].id || povWinner.id == initialNominees[1].id) {
        descisionText += "...to use the power of veto on myself.";
    } else {
        descisionText += `...to use the power of veto on ${povTarget.name}.`;
    }
    let replacementSpeech = "";
    let nameAReplacement = "";
    let finalNominees: any[] = initialNominees;
    if (povTarget) {
        finalNominees = initialNominees.filter(hg => hg.id != povTarget!.id);
        nameAReplacement += ` ${HoH.name}, since I have just vetoed one of your nominations, you must name a replacement nominee.`;
        const replacementNom = {
            ...getById(
                initialGameState,
                nominateNPlayers(
                    HoH,
                    exclude(initialGameState.houseguests, [
                        HoH,
                        initialNominees[0],
                        initialNominees[1],
                        povWinner
                    ]),
                    initialGameState,
                    1
                )[0].decision
            )
        };
        replacementNom.nominations++;
        finalNominees.push(replacementNom);
        getById(initialGameState, replacementNom.id).nominations++;
        replacementSpeech = `My replacement nominee is ${replacementNom.name}.`;
    }
    const scene = new Scene({
        title: "Veto Ceremony",
        gameState: initialGameState,
        content: (
            <div>
                This is the Veto Ceremony.
                <br />
                {`${initialNominees[0].name} and ${initialNominees[1].name} have been nominated for eviction.`}
                <Portraits houseguests={initialNominees} />
                But I have the power to veto one of these nominations.
                <br />
                <b>
                    I have decided... <br />
                    <Portrait houseguest={{ ...povWinner, tooltip: vetoChoice.reason }} />
                    {descisionText}
                </b>
                {nameAReplacement}
                {replacementSpeech && <Portrait houseguest={HoH} />}
                <b>{replacementSpeech}</b>
                <Portraits houseguests={finalNominees} />
                <NextEpisodeButton />
            </div>
        )
    });
    return [scene, finalNominees];
}
