import { Houseguest, GameState } from "../../../model";
import { HouseguestWithLogic, useDiamondVeto, useGoldenVeto } from "../../../utils/ai/aiApi";

export interface Veto {
    name: string;
    use: (hero: Houseguest, nominees: Houseguest[], gameState: GameState, HoH: number) => HouseguestWithLogic;
}

export const GoldenVeto: Veto = {
    name: "Golden Power of Veto",
    use: useGoldenVeto,
};

export const DiamondVeto: Veto = {
    name: "Diamond Power of Veto",
    use: useDiamondVeto,
};

export const SpotlightVeto: Veto = {
    name: "Spotlight Power of Veto",
    use: (hero: Houseguest, nominees: Houseguest[], gameState: GameState, HoH: number) => {
        throw new Error("Not implemented");
    },
};
