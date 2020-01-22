import { GameState, Houseguest, getById, exclude } from "../../../model";
import { Scene } from "../scene";
import { useGoldenVeto, nominateNPlayers } from "../../../utils/ai/aiApi";
import { Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";

export function generateVetoCeremonyScene(
    initialGameState: GameState,
    HoH: Houseguest,
    initialNominees: Houseguest[],
    povWinner: Houseguest
): [GameState, Scene, Houseguest[]] {
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
    let finalNominees: any[] = [...initialNominees];
    if (povTarget) {
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
        const replacementIndex = initialNominees.findIndex(hg => hg.id === vetoChoice.decision!.id);
        finalNominees[replacementIndex] = replacementNom;
        replacementNom.nominations++;
        getById(initialGameState, replacementNom.id).nominations++;
        replacementSpeech = `My replacement nominee is ${replacementNom.name}.`;
    }
    const scene = new Scene({
        title: "Veto Ceremony",
        gameState: initialGameState,
        content: (
            <div>
                <Centered>This is the Veto Ceremony.</Centered>
                <Centered>
                    {`${initialNominees[0].name} and ${initialNominees[1].name} have been nominated for eviction, 
                    but I have the power to veto one of these nominations.`}
                </Centered>
                <div className="columns is-marginless is-centered">
                    <DividerBox className="column">
                        <Portrait centered={true} houseguest={initialNominees[0]} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Portrait centered={true} houseguest={initialNominees[1]} />
                    </DividerBox>
                </div>
                <CenteredBold>
                    I have decided... <br />
                    <Portrait centered={true} houseguest={{ ...povWinner, tooltip: vetoChoice.reason }} />
                    {descisionText}
                </CenteredBold>
                <Centered>{nameAReplacement}</Centered>
                {replacementSpeech && <Portrait centered={true} houseguest={HoH} />}
                <CenteredBold>{replacementSpeech}</CenteredBold>
                <div className="columns is-marginless is-centered">
                    <DividerBox className="column">
                        <Portrait centered={true} houseguest={finalNominees[0]} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Portrait centered={true} houseguest={finalNominees[1]} />
                    </DividerBox>
                </div>
                <NextEpisodeButton />
            </div>
        )
    });
    initialGameState.currentLog.nominationsPostVeto = [finalNominees[0].id, finalNominees[1].id];
    return [initialGameState, scene, finalNominees];
}
