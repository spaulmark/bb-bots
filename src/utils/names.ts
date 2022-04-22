export function listNames(names: string[]): string {
    if (names.length === 0) {
        return "";
    }
    if (names.length === 1) {
        return names[0];
    }
    if (names.length === 2) {
        return names[0] + " and " + names[1];
    }
    return names.slice(0, names.length - 1).join(", ") + ", and " + names[names.length - 1];
}
