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

export function listVotes(votes: string[]): string {
    if (votes.length === 0) {
        return "";
    }
    if (votes.length === 1) {
        return votes[0];
    }
    return votes.slice(0, votes.length - 1).join(` to `) + ` to ` + votes[votes.length - 1];
}
