import { Houseguest } from "../../model";
import {
    TargetStrategy,
    WinrateStrategy,
    determineTargetStrategy,
    determineWinrateStrategy,
} from "./targets";

export type Intent = "good" | "bad";

export function generateExcuse(
    hero: Houseguest,
    decision: number,
    options: number[],
    intent: Intent
): string {
    const targetStrategy = determineTargetStrategy(hero);
    const winrateStrategy = determineWinrateStrategy(hero);
    if (winrateStrategy === WinrateStrategy.High) {
        if (targetStrategy === TargetStrategy.Underdog) {
            return "generateExcuse_high_underdog(hero, decision, options, intent);";
        }
        return generateExcuse_high_statusquo(hero, decision, options, intent);
    } else if (winrateStrategy === WinrateStrategy.Medium) {
        if (targetStrategy === TargetStrategy.Underdog)
            return "generateExcuse_med_underdog(hero, decision, options, intent);";
        return "generateExcuse_med_statusquo(hero, decision, options, intent);";
    } else {
        if (targetStrategy === TargetStrategy.Underdog)
            return "generateExcuse_low_underdog(hero, decision, options, intent);";
        return "generateExcuse_low_statusquo(hero, decision, options, intent);";
    }
}

function generateExcuse_high_statusquo(
    hero: Houseguest,
    decision: number,
    options: number[],
    intent: Intent
): string {
    // TODO: a function based on relationship only... X is my friend, etc.
    return " i felt likt it was the right thing to do";
}
