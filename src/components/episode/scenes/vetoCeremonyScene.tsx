import { GameState, Houseguest, getById, exclude } from "../../../model";
import { Scene } from "./scene";
import { backdoorNPlayers } from "../../../utils/ai/aiApi";
import { Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { listNames } from "../../../utils/listStrings";
import _ from "lodash";
import { BoomerangVeto, DiamondVeto, Veto } from "../veto/veto";

export function generateVetoCeremonyScene(
    initialGameState: GameState,
    hohArray: Houseguest[],
    initialNominees: Houseguest[],
    povWinner: Houseguest,
    doubleEviction: boolean,
    veto: Veto
): [GameState, Scene, Houseguest[]] {
    let povTarget: Houseguest | null = null;
    let descisionText = "";

    initialNominees = initialNominees.map((nominee) => {
        return getById(initialGameState, nominee.id);
    });
    const HoH = hohArray[0];
    const coHoH = hohArray.length > 1 ? hohArray[1] : undefined;

    const vetoChoice = veto.use(povWinner, initialNominees, initialGameState, HoH.id);

    let nomineeWonPov = false;
    initialNominees.forEach((nom) => nom.id === povWinner.id && (nomineeWonPov = true));

    povTarget = vetoChoice.decision;
    const tousethepov = "to use the power of veto";
    if (!povTarget) {
        descisionText += `... not ${tousethepov}.`;
    } else if (veto === BoomerangVeto) {
        descisionText += `... ${tousethepov}.`;
    } else if (nomineeWonPov) {
        descisionText += `...${tousethepov} on myself.`;
    } else {
        descisionText += `...${tousethepov} on ${povTarget.name}.`;
    }
    let replacementSpeech = "";
    let nameAReplacement = "";
    let finalNominees: any[] = [...initialNominees];
    const HoHnamer = coHoH && povTarget ? (povTarget.id === initialNominees[1].id ? coHoH : HoH) : HoH;
    const replacementNomineeNamer = veto === DiamondVeto ? povWinner : HoHnamer;
    if (povTarget) {
        const HoHwonPoV = HoH.id === povWinner.id;
        const aReplacementNominee = veto === BoomerangVeto ? "replacement nominees" : "a replacement nominee";
        nameAReplacement += HoHwonPoV
            ? `Since I have just vetoed one of my nominations, I must name ${aReplacementNominee}.`
            : `${HoHnamer.name}, since I have just vetoed ${
                  veto !== BoomerangVeto ? "one of " : ""
              }your nominations, ${veto === DiamondVeto ? "I" : "you"} must name ${aReplacementNominee}.`;
        // if the exclusion yielded no options, you may be forced to name the veto winner as a replacement
        let exclusion = exclude(initialGameState.houseguests, [
            HoH,
            ...initialNominees,
            povWinner,
            coHoH || HoH,
        ]);
        if (exclusion.length === 0) {
            exclusion = exclude(initialGameState.houseguests, [HoH, ...initialNominees]);
        }
        const replacementCount = veto === BoomerangVeto ? 2 : 1;
        const replacementNoms = backdoorNPlayers(
            replacementNomineeNamer,
            exclusion,
            initialGameState,
            replacementCount
        ).map((v) => {
            return getById(initialGameState, v.decision);
        });
        if (replacementNoms.length === 1) {
            const replacementNom = replacementNoms[0];
            const replacementIndex = initialNominees.findIndex((hg) => hg.id === vetoChoice.decision!.id);
            finalNominees[replacementIndex] = replacementNom;
            replacementNom.nominations++;
            replacementSpeech = `My replacement nominee is ${replacementNom.name}.`;
        } else {
            finalNominees = replacementNoms;
            finalNominees.forEach((nom) => nom.nominations++);
            replacementSpeech = `My replacement nominees are ${listNames(
                replacementNoms.map((n) => n.name)
            )}.`;
        }
    }
    const nomineeNames = initialNominees.map((nom) => nom.name);
    const scene = new Scene({
        title: "Veto Ceremony",
        gameState: initialGameState,
        content: (
            <div>
                {!doubleEviction && <Centered>This is the Veto Ceremony.</Centered>}
                {!doubleEviction && (
                    <Centered>
                        {`${listNames(nomineeNames)} have been nominated for eviction, 
                    but I have the power to veto one of these nominations.`}
                    </Centered>
                )}
                <div className="columns is-marginless is-centered">
                    {initialNominees.map((nom, i) => (
                        <DividerBox className="column" key={`nominee-${i}`}>
                            <Portrait centered={true} houseguest={nom} />
                        </DividerBox>
                    ))}
                </div>
                <CenteredBold>
                    I have decided... <br />
                </CenteredBold>
                <Portrait centered={true} houseguest={{ ...povWinner, tooltip: vetoChoice.reason }} />
                <CenteredBold noMargin={true}>{descisionText}</CenteredBold>
                <Centered>{nameAReplacement}</Centered>
                {replacementSpeech && <Portrait centered={true} houseguest={replacementNomineeNamer} />}
                <CenteredBold>{replacementSpeech}</CenteredBold>
                <div className="columns is-marginless is-centered">
                    {finalNominees.map((nom, i) => (
                        <DividerBox className="column" key={`final-nominee-${i}`}>
                            <Portrait centered={true} houseguest={nom} />
                        </DividerBox>
                    ))}
                </div>
                {!doubleEviction && <NextEpisodeButton />}
            </div>
        ),
    });
    initialGameState.currentLog.nominationsPostVeto = require("alphanum-sort")(
        finalNominees.map((nom) => nom.name)
    );
    return [initialGameState, scene, finalNominees];
}
