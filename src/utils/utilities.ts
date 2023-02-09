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

export function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    let _intersection = new Set<T>();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}
export function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    let _difference = new Set<T>(setA);
    for (let elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
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

export function isWellDefined(x: any): boolean {
    return !isNotWellDefined(x);
}

export function isNotWellDefined(x: any): x is null | undefined {
    return x === null || x === undefined;
}

function dot(x: number[], y: number[]) {
    if (x.length !== y.length)
        throw new Error(
            `Tried to get the dot product between two vectors of non-equal length: ${x.length} !== ${y.length}`
        );
    let result = 0;
    x.forEach((_, i) => {
        result += x[i] * y[i];
    });
    return result;
}

function magnitude(x: number[]): number {
    let result = 0;
    x.forEach((x) => (result += x ** 2));
    return Math.sqrt(result);
}

export function linear_transform(
    x: number,
    input_start: number,
    input_end: number,
    output_start: number,
    output_end: number
) {
    return ((x - input_start) / (input_end - input_start)) * (output_end - output_start) + output_start;
}

// returns a value between 0 and pi
export function angleBetween(x: number[], y: number[]): number {
    if (x.length !== y.length)
        throw new Error(
            `Tried to get the angle between two vectors of non-equal length: ${x.length} !== ${y.length}`
        );
    return Math.acos((dot(x, y) / magnitude(x)) * magnitude(y));
}

// takes in an array, a number n, and a match function, then removes the first n elements from the array for which the match function returns true
// returns the index for which something was removed
export function removeFirstNMatching(
    array: any[],
    n: number,
    match: (x: any) => boolean,
    startAt?: number
): number {
    let i = startAt || 0;
    while (i < array.length && n > 0) {
        if (match(array[i])) {
            n--;
            array.splice(i, 1);
            i--;
        }
        i++;
    }
    return i;
}

// takes in an array, a number n, and a match function, then removes the last elements from the array for which the match function returns true
// returns the index of the first element that does not match, or -1

export function removeLast1Matching(array: any[], match: (x: any) => boolean): number {
    let i = array.length - 1;
    while (i >= 0) {
        if (match(array[i])) {
            array.splice(i, 1);
            return i;
        }
        i--;
    }
    return -1;
}

export function sortAlphaNum(array: string[]) {
    return array.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}
