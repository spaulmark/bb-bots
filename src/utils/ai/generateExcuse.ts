import { Houseguest } from "../../model";
import { determineTargetStrategy, determineWinrateStrategy } from "./hitList";
import { TargetStrategy, WinrateStrategy } from "./targets";

export type Intent = "good" | "bad";

export function generateExcuse(
    hero: Houseguest,
    decision: number,
    options: number[],
    intent: Intent
): string {
    const name = hero.hitList.filter((hg) => hg.id === decision)[0].name;
    const targetStrategy = determineTargetStrategy(hero);
    const winrateStrategy = determineWinrateStrategy(hero);
    if (winrateStrategy === WinrateStrategy.High) {
        if (targetStrategy === TargetStrategy.Underdog) {
            return "generateExcuse_high_underdog(hero, decision, options, intent);";
        }
        return generateExcuse_high_statusquo(intent, name);
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

function generateExcuse_high_statusquo(intent: Intent, name: string): string {
    // TODO: make this better
    // TODO: triple eviction should use good intent somehow
    return `I have a ${intent === "good" ? "better" : "worse"} relationship with ${name}.`;
}
