import React from "react";
import { GameState, getById } from "../../model";
import { Portraits } from "../playerPortrait/portraits";

interface AllianceListProps {
    gameState: GameState;
}

export function AllianceList(props: AllianceListProps) {
    const cliques = props.gameState.cliques;
    const elements: JSX.Element[] = cliques.map((clique, i) => (
        <Portraits
            centered={true}
            key={`${clique}, ${i}, ${props.gameState.phase}`}
            houseguests={clique.map((id) => getById(props.gameState, id))}
        />
    ));
    return <div>{elements}</div>;
}
// TODO: clicking someone ON THE ALLIANCE PAGE shows only their alliances???
