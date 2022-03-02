import React from "react";
import { canDisplayCliques, GameState, getById } from "../../model";
import { isNotWellDefined } from "../../utils";
import { Centered } from "../layout/centered";
import { HasText } from "../layout/text";
import { Portraits } from "../playerPortrait/portraits";

interface AllianceListProps {
    gameState: GameState;
}

export function AllianceList(props: AllianceListProps) {
    if (!canDisplayCliques(props.gameState))
        return (
            <HasText>
                <Centered>
                    ⚠️ There are too many players left in the game to display the alliances! Try again when
                    there are 30 or less! ⚠️
                </Centered>
            </HasText>
        );
    const cliques = props.gameState.cliques;
    const elements: JSX.Element[] = cliques.map((clique, i) => {
        if (isNotWellDefined(clique.affiliates)) {
            return (
                <Portraits
                    centered={true}
                    detailed={true}
                    key={`${clique}, ${i}, ${props.gameState.phase}`}
                    houseguests={clique.core.map((id) => getById(props.gameState, id))}
                />
            );
        }
        const test2: (number | "←" | "→")[] = [
            ...clique.affiliates[0],
            "→",
            ...clique.core,
            "←",
            ...clique.affiliates[1],
        ];
        return (
            <Portraits
                centered={true}
                detailed={true}
                key={`${clique}, ${i}, ${props.gameState.phase}`}
                houseguests={test2.map((id) => {
                    if (id === "←") return "←";
                    if (id === "→") return "→";
                    return getById(props.gameState, id);
                })}
            />
        );
    });
    return <div>{elements}</div>;
}
