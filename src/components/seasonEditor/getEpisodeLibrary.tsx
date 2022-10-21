import { Episode, EpisodeType } from "../episode/episodes";
import { BigBrotherVanilla } from "../episode/bigBrotherEpisode";
import { shuffle, sum } from "lodash";
import { EpisodeLibrary } from "../../model/season";
import { GameState, getById, MutableGameState } from "../../model/gameState";
import { getTeamsListContents } from "./teamsAdderList";
import { EndTeamVote, TeamVote } from "../../model/logging/voteType";
import { hasLogBeenModified } from "../../model/logging/episodelog";
import { TeamAdderProps } from "./teamsAdder";
import { _items, deleteTeams, _castSize } from "./seasonEditorList";
import { isNotWellDefined } from "../../utils";

export function getEpisodeLibrary(): EpisodeLibrary {
    const generate = (_: any) => {
        throw "UNREACHABLE";
    };
    const episodes: EpisodeType[] = [];
    const teamListContents = getTeamsListContents();
    // generate teams
    let finalX = _castSize;
    const teamIdtoFinalX = new Map<number, number>();
    const _mappedItems = _items.map((item) => {
        if (item.episode.teamsLookupId !== undefined) {
            // if a team ends when it starts, don't use it FIXME: this will break 10000% when returnees happen
            // eslint-disable-next-line
            if (parseInt(teamListContents[item.episode.teamsLookupId!].endsWhen) === finalX) return;
            teamIdtoFinalX.set(item.episode.teamsLookupId, finalX);
            const dynamicEpisodeType = {
                canPlayWith: (n: number) => n > 3,
                eliminates: 0,
                pseudo: true,
                emoji: "🎌",
                teamsLookupId: item.episode.teamsLookupId,
            };
            item.episode = {
                ...dynamicEpisodeType,
                generate: (initialGamestate: GameState) => {
                    let currentGameState = new MutableGameState(initialGamestate);
                    const teams = Object.values(teamListContents[item.episode.teamsLookupId!].Teams);
                    const nonEvictedHouseguests: number[] = shuffle(
                        Array.from(currentGameState.nonEvictedHouseguests)
                    );
                    // if we are in a log that has been modified, increment log index to make a new one for teams //
                    const logWasModified = hasLogBeenModified(currentGameState.currentLog);
                    // if the log was modified, jump to a new one for teams //
                    logWasModified && currentGameState.incrementLogIndex();

                    // now assign them to teams using the modulo operator
                    nonEvictedHouseguests.forEach((hgid, i) => {
                        const hg = getById(currentGameState, hgid);
                        const team = teams[i % teams.length];
                        hg.tribe = team;
                        currentGameState.currentLog.votes[hg.id] = new TeamVote(team.color);
                    });
                    currentGameState.currentLog.pseudo = true;
                    // if the log was not modified earlier, make a new one so we will have something to write to
                    // for the upcoming episode
                    !logWasModified && currentGameState.incrementLogIndex();
                    // add all the teams as team votes
                    return new Episode({
                        gameState: new GameState(currentGameState),
                        initialGamestate: new GameState(currentGameState),
                        scenes: [],
                        type: {
                            ...dynamicEpisodeType,
                            generate,
                        },
                    });
                },
            };
        }
        finalX -= item.episode.eliminates;
        return item;
    });

    // typescript is retarded so it is unable to realize that i am REMOVING the undefined items in this filter statement
    const mappedItems: any[] = _mappedItems.filter((item) => !isNotWellDefined(item));
    // FIXME: 3 is a magic number because you can't have twists after F4
    // this may need to change in the future if we add final 3 endgames
    const totalPlayers = sum(mappedItems.map((item) => item.episode.eliminates)) + 3;

    Object.values(teamListContents).forEach((item: TeamAdderProps) => {
        const endsAt: number = parseInt(item.endsWhen);
        const startsAt = teamIdtoFinalX.get(item.id)!;
        // find startsAt, and if endsAt was before startsAt, don't bother ending
        if (endsAt >= startsAt) return;
        // similarly, if there is another team phase between startsAt and endsAt, also don't bother
        // FIXME: this will break SO HARD when we do returnees
        let invalid = false;
        teamIdtoFinalX.forEach((finalX, teamId) => {
            if (invalid) return;
            if (teamId !== item.id && startsAt > finalX && endsAt < finalX) {
                invalid = true;
            }
        });
        if (invalid) return;

        const teams: number[] = Object.keys(item.Teams).map((key) => parseInt(key));
        const dynamicEpisodeType = {
            pseudo: true,
            canPlayWith: () => true,
            eliminates: 0,
            emoji: "🏁",
        };
        const endTeamsEpisodeType: EpisodeType = {
            ...dynamicEpisodeType,
            generate: (initialGamestate: GameState): Episode => {
                let currentGameState = new MutableGameState(initialGamestate);
                deleteTeams(currentGameState, new Set<number>(teams));

                // if we are in a log that has been modified, increment log index to make a new one for teams //
                const logWasModified = hasLogBeenModified(currentGameState.currentLog);
                // if the log was modified, jump to a new one for teams //
                logWasModified && currentGameState.incrementLogIndex();

                // now assign them to teams using the modulo operator
                currentGameState.nonEvictedHouseguests.forEach((hgid) => {
                    const hg = getById(currentGameState, hgid);
                    currentGameState.currentLog.votes[hg.id] = new EndTeamVote("black");
                });
                currentGameState.currentLog.pseudo = true;
                // if the log was not modified earlier, make a new one so we will have something to write to
                // for the upcoming episode
                !logWasModified && currentGameState.incrementLogIndex();

                return new Episode({
                    gameState: new GameState(currentGameState),
                    initialGamestate,
                    scenes: [],
                    type: {
                        ...dynamicEpisodeType,
                        generate,
                    },
                });
            },
        };
        if (endsAt < 3) return; // no point in ending teams that never end
        let i = 0;
        let playersRemaining = totalPlayers;
        while (endsAt < playersRemaining && endsAt > 3) {
            playersRemaining -= mappedItems[i].episode.eliminates;
            i++;
        }
        mappedItems.splice(i, 0, { episode: endTeamsEpisodeType });
    });

    let previousItem: EpisodeType | undefined = undefined;
    for (const item of mappedItems) {
        if (item.episode.pseudo) {
            previousItem = item.episode;
            continue;
        }
        // if previous item is pseudo, chain it to the current one then continue running code
        if (previousItem && previousItem.pseudo) {
            // so basically the exact same thing as item, but emojis are chained
            const pseudoItem = previousItem;
            const newItem = item.episode;
            const common = {
                canPlayWith: () => true,
                eliminates: pseudoItem.eliminates + newItem.eliminates,
                emoji: `${pseudoItem.emoji} ${newItem.emoji}`,
            };
            item.episode = {
                ...common,
                chainable: !!newItem.chainable,
                generate: (initialGamestate: GameState) => {
                    const firstEpisode = pseudoItem.generate(initialGamestate);
                    const secondEpisode = newItem.generate(firstEpisode.gameState);
                    return new Episode({
                        gameState: new GameState(secondEpisode.gameState),
                        initialGamestate: new GameState(firstEpisode.gameState),
                        scenes: secondEpisode.scenes,
                        type: {
                            ...newItem,
                            ...common,
                            generate,
                        },
                    });
                },
            };
            previousItem = undefined;
        }
        // if not chainable, push to newItems
        if (!item.episode.chainable) {
            episodes.push(item.episode);
        } else {
            // if chainable, merge most recent newItems item
            const oldEpisode = episodes[episodes.length - 1];
            const newEpisode = item.episode;
            const dynamicEpisodeType = {
                arrowsEnabled: oldEpisode.arrowsEnabled || newEpisode.arrowsEnabled,
                canPlayWith: () => true,
                eliminates: oldEpisode.eliminates + newEpisode.eliminates,
                hasViewsbar: oldEpisode.hasViewsbar || newEpisode.hasViewsbar,
                emoji: `${oldEpisode.emoji} ${newEpisode.emoji}`,
            };
            const newItem: EpisodeType = {
                ...dynamicEpisodeType,
                generate: (initialGamestate) => {
                    const firstEpisode = oldEpisode.generate(initialGamestate);
                    const secondEpisode = newEpisode.generate(firstEpisode.gameState);
                    return new Episode({
                        gameState: new GameState(secondEpisode.gameState),
                        // extremely important: pseudo stuff like teams happens in the initial gamestate
                        initialGamestate: firstEpisode.initialGameState,
                        scenes: firstEpisode.scenes.concat(secondEpisode.scenes),
                        type: {
                            ...dynamicEpisodeType,
                            generate,
                        },
                    });
                },
            };
            episodes[episodes.length - 1] = newItem;
            previousItem = newItem;
        }
    }

    const result: EpisodeLibrary = {};
    let playersRemaining = _castSize;
    for (const episode of episodes) {
        if (episode !== BigBrotherVanilla) {
            result[playersRemaining] = episode;
        }
        playersRemaining -= episode.eliminates;
    }
    return result;
}
