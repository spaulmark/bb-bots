import { GameState, Houseguest, MutableGameState } from "../../model";
import { Episode, EpisodeType } from "./episodes";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateNomCeremonyScene } from "./scenes/nomCeremonyScene";
import { generateVetoCompScene } from "./scenes/vetoCompScene";
import { generateVetoCeremonyScene } from "./scenes/vetoCeremonyScene";
import { generateEvictionScene } from "./scenes/evictionScene";
import { PoVvote } from "../../model/logging/voteType";

export const CoHoH: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Co-HoH",
    description:
        "Two HoHs each name one nominee, and are responsible for replacing the person they nominated if the veto is used on them.",
    emoji: "👥",
    generate: generateCoHoH,
};

function generateCoHoH(initialGamestate: GameState): Episode {
    // generate (co)-hoh scene
    let currentGameState = new MutableGameState(initialGamestate);
    let hohArray: Houseguest[];
    let hohCompScene: Scene;
    const scenes: Scene[] = [];
    [currentGameState, hohCompScene, hohArray] = generateHohCompScene(currentGameState, {
        coHoH: true,
        coHohIsFinal: true,
    });
    scenes.push(hohCompScene);

    // generate nominations scene
    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(currentGameState, hohArray, {});
    scenes.push(nomCeremonyScene);
    // veto comp
    let vetoCompScene;
    let povWinner: Houseguest;
    [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(
        currentGameState,
        hohArray,
        nominees,
        { veto: GoldenVeto }
    );
    scenes.push(vetoCompScene);
    // veto replacement scene might be different because each hoh nominated one person, so whoever gets vetoed, that hoh replaces
    let vetoCeremonyScene;

    [currentGameState, vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
        currentGameState,
        hohArray,
        nominees,
        povWinner,
        { veto: GoldenVeto }
    );
    scenes.push(vetoCeremonyScene);

    // then eviction scene
    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(currentGameState, hohArray, nominees, {
        votingTo: "Evict",
        tieBreaker: { hg: povWinner, text: "Power of Veto winner", voteType: (id) => new PoVvote(id) },
    });
    scenes.push(evictionScene);
    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        scenes,
        type: CoHoH,
    });
}
