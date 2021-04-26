export function hashcode(string: string): number {
    let hash = 0,
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

export function average(x: number[]): number {
    let sum = 0;
    x.forEach((xi) => (sum += xi));
    return sum / x.length;
}

export function isWellDefined(x: any) {
    return x !== null && x !== undefined;
}

export function isNotWellDefined(x: any): x is null | undefined {
    return x === null || x === undefined;
}

export function eucDistance(a: number[], b: number[]) {
    if (a.length !== b.length)
        throw new Error(
            `Attempted to calculate distance between arrays of mismatched length. a.length=${a.length}, b.length=${b.length}`
        );
    return (
        a
            .map((x: number, i: number) => Math.abs(x - b[i]) ** 2) // square the difference
            .reduce((sum: number, now: number) => sum + now) ** // sum
        (1 / 2)
    );
}
