import { GameState, Houseguest, MutableGameState } from "../../model";
import { Episode, EpisodeType } from "./episodes";
import { Scene } from "./scenes/scene";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateBotbNomCeremonyScene } from "./scenes/botbNomCeremonyScene";

export const BattleOfTheBlock: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 1,
    arrowsEnabled: true,
    emoji: "⚔️",
    hasViewsbar: true,
    name: "Battle of the Block",
    generate: generateBoB,
};

function generateBoB(initialGamestate: GameState): Episode {
    // generate (co)-hoh scene
    let currentGameState = new MutableGameState(initialGamestate);
    let hohArray: Houseguest[];
    let hohCompScene: Scene;
    const scenes: Scene[] = [];
    [currentGameState, hohCompScene, hohArray] = generateHohCompScene(currentGameState, {
        coHoH: true,
        coHohIsFinal: false,
    });
    scenes.push(hohCompScene);
    // nominations, but with TWO sets of nominees
    let nomCeremonyScene;
    let nominees: Houseguest[][];
    [currentGameState, nomCeremonyScene, nominees] = generateBotbNomCeremonyScene(
        currentGameState,
        hohArray[0],
        hohArray[1]
    );
    scenes.push(nomCeremonyScene);
    // then battle of the block where one of the HoHs is dethroned

    // then veto onwards plays normally

    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        title: `Week ${currentGameState.phase}`,
        scenes,
        type: BattleOfTheBlock,
    });
}
