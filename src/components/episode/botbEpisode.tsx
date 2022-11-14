import { GameState, Houseguest, MutableGameState } from "../../model";
import { Episode, EpisodeType } from "./episodes";
import { Scene } from "./scenes/scene";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateBotbNomCeremonyScene } from "./scenes/botbNomCeremonyScene";
import { generateVetoScenesOnwards } from "./bigBrotherEpisode";
import { GoldenVeto } from "./veto/veto";
import { generateBotbScene } from "./scenes/botbScene";

export const BattleOfTheBlock: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 1,
    arrowsEnabled: true,
    emoji: "⚔️",
    hasViewsbar: true,
    name: "Battle of the Block",
    description:
        "Two HoHs name a total of four nominees. The nominees compete in a competition, and the winners are safe for the week and dethrone the HoH who nominated them.",
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
    let botbscene;
    let finalhoh;
    let finalnoms;
    let botbWinners;
    [currentGameState, botbscene, finalhoh, finalnoms, botbWinners] = generateBotbScene(
        currentGameState,
        hohArray,
        [...nominees[0], ...nominees[1]]
    );
    scenes.push(botbscene);
    // then veto onwards plays normally except
    // the winning pair is somehow immune for the week: they can't be backdoored.
    const vetostuff = generateVetoScenesOnwards(
        GoldenVeto,
        currentGameState,
        finalhoh,
        finalnoms,
        false,
        scenes,
        botbWinners,
        undefined
    );
    currentGameState = vetostuff.gameState;

    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        scenes: vetostuff.scenes,
        type: BattleOfTheBlock,
    });
}
