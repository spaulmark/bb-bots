// spits out the next episode given a gamestate, in addition to the new gamestate.
// allows for re-use, because you can give it the initial gamestate, and then just keep asking for the next season.
export function hashcode(string: string): number {
    var hash = 0,
        i,
        chr;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}

export function roundTwoDigits(number: number | undefined) {
    if (!number) {
        return 0;
    }
    return Math.round(number * 100);
}

export function max(a: number, b: number) {
    return a > b ? a : b;
}

export function extremeValues(x: number | undefined): number {
    if (!x) {
        return 0;
    }
    const xSquared = x * x;
    if (x >= 0) {
        return -xSquared + 2 * x;
    } else {
        return xSquared + 2 * x;
    }
}
