import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Draggable } from "react-beautiful-dnd";
import React from "react";
import styled from "styled-components";
import { Episode, EpisodeType } from "../episode/episodes";
import { BigBrotherVanilla } from "../episode/bigBrotherEpisode";
import { BehaviorSubject, Subscription } from "rxjs";
import { getEmoji, twist$ } from "./twistAdder";
import { min, shuffle, sum } from "lodash";
import { removeFirstNMatching, removeLast1Matching } from "../../utils";
import { EpisodeLibrary } from "../../model/season";
import { GameState, getById, MutableGameState } from "../../model/gameState";
import { getTeamsListContents } from "./teamsAdderList";

const common = `
padding: 10px;
border-radius: 6px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
margin: 0 0 3px 0;
border: 1px solid #6c6c6c;
display: grid;
flex-direction: column;
`;

const InvalidDragItem = styled.div`
    ${common}
    background: #ffe1ea;
    color: red;
`;

const DragItem = styled.div`
    ${common}
    background: #444346;
    color: #fff;
`;

let _items: { episode: EpisodeType }[] = [];
let _castSize: number = 0;

function deleteTeams(gameState: GameState, toDelete: Set<number>): void {
    gameState.nonEvictedHouseguests.forEach((hgid) => {
        const hg = getById(gameState, hgid);
        const tribe = hg.tribe;
        if (!tribe) return;
        if (toDelete.has(tribe.tribeId)) {
            hg.tribe = undefined;
        }
    });
}

export function getEpisodeLibrary(): EpisodeLibrary {
    const episodes: EpisodeType[] = [];
    const teamListContents = getTeamsListContents();
    // generate teams

    const mappedItems = _items.map((item) => {
        if (item.episode.teamsLookupId !== undefined) {
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
                    // now assign them to teams using the modulo operator
                    nonEvictedHouseguests.forEach((hgid, i) => {
                        const hg = getById(currentGameState, hgid);
                        hg.tribe = teams[i % teams.length];
                    });
                    return new Episode({
                        gameState: new GameState(currentGameState),
                        initialGamestate: new GameState(currentGameState), // note that this is usually initialgamestate
                        scenes: [],
                        type: {
                            ...dynamicEpisodeType,
                            generate: (_) => {
                                throw "UNREACHABLE";
                            },
                        },
                    });
                },
            };
        }
        return item;
    });
    // 3 is a magic number because you can't have twists after F4
    // this may need to change in the future if we add final 3 endgames
    const totalPlayers = sum(mappedItems.map((item) => item.episode.eliminates)) + 3;

    Object.values(teamListContents).forEach((item) => {
        const endsAt: number = parseInt(item.endsWhen);
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
                return new Episode({
                    gameState: new GameState(currentGameState),
                    initialGamestate,
                    scenes: [],
                    type: {
                        ...dynamicEpisodeType,
                        generate: (_) => {
                            throw "UNREACHABLE";
                        },
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
                generate: (initialGamestate) => {
                    const firstEpisode = pseudoItem.generate(initialGamestate);
                    const secondEpisode = newItem.generate(firstEpisode.gameState);
                    return new Episode({
                        gameState: new GameState(secondEpisode.gameState),
                        initialGamestate: new GameState(firstEpisode.gameState), // IMPORTANT, b/c teams happen before pregame
                        scenes: secondEpisode.scenes,
                        type: {
                            ...newItem,
                            ...common,
                            generate: (_) => {
                                throw "UNREACHABLE";
                            },
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
                        initialGamestate,
                        scenes: firstEpisode.scenes.concat(secondEpisode.scenes),
                        type: {
                            ...dynamicEpisodeType,
                            generate: (_) => {
                                throw "UNREACHABLE";
                            },
                        },
                    });
                },
            };
            episodes[episodes.length - 1] = newItem;
            previousItem = newItem; // this line may not be required
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

const ListItem = ({
    item,
    provided,
    snapshot,
}: {
    item: SeasonEditorListItem;
    provided: any;
    snapshot: any;
}): JSX.Element => {
    const Item = item.isValid ? DragItem : InvalidDragItem;
    return (
        <Item
            ref={provided.innerRef}
            snapshot={snapshot}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
        >
            <span>{`${item.weekText}${
                item.episode !== BigBrotherVanilla ? ` | ${getEmoji(item.episode) + item.episode.name}` : ""
            }`}</span>
        </Item>
    );
};

interface SeasonEditorListProps {
    castSize: number;
    setTwistsValid: (valid: boolean) => void;
}

interface SeasonEditorListState {
    items: SeasonEditorListItem[];
}

interface SeasonEditorListItem {
    id: string;
    weekText: string;
    episode: EpisodeType;
    isValid: boolean;
}

export const twistCapacity$ = new BehaviorSubject<number>(0);

export class SeasonEditorList extends React.Component<SeasonEditorListProps, SeasonEditorListState> {
    private id: number = 0;
    private subs: Subscription[] = [];

    public constructor(props: SeasonEditorListProps) {
        super(props);
        _castSize = props.castSize;
        const elements: SeasonEditorListItem[] = [];
        let week: number = 0;
        for (let i = props.castSize; i > 3; i--) {
            week++;
            elements.push({
                id: (this.id++).toString(),
                weekText: `Week ${week}: F${i}`,
                episode: BigBrotherVanilla,
                isValid: true,
            });
        }
        _items = elements;
        this.state = { items: elements };
    }

    private maxCapacity(): number {
        return this.props.castSize - 3;
    }

    private updateTwistCapacity(newCapacity: number) {
        twistCapacity$.next(newCapacity);
    }

    private addRemoveTwist(twist: { type: EpisodeType; add: boolean }) {
        this.updateTwistCapacity(
            twist.add
                ? min([twistCapacity$.value - twist.type.eliminates, this.maxCapacity()]) || 0
                : twistCapacity$.value + twist.type.eliminates
        );
        // add or remove the twist
        if (twist.add) {
            // remove X vanilla episodes, then add the twist
            const newItems = Array.from(this.state.items);
            removeFirstNMatching(
                newItems,
                twist.type.eliminates,
                (item) => item.episode === BigBrotherVanilla,
                twist.type.chainable ? 1 : 0
            );
            // if chainable, add at index 1 instead
            const insertAt = newItems.findIndex(
                (value, index, obj) => index > 0 && value.episode === BigBrotherVanilla
            );
            const newItem = {
                id: (this.id++).toString(),
                weekText: ``,
                episode: twist.type,
                isValid: true,
            };
            twist.type.chainable ? newItems.splice(insertAt, 0, newItem) : newItems.unshift(newItem);
            this.refreshItems(newItems);
        } else {
            // remove the LAST instance of the twist, and add X vanilla episodes
            const newItems = Array.from(this.state.items);
            const i = removeLast1Matching(newItems, (item) => {
                const equalTeamsLookupIds = twist.type.teamsLookupId
                    ? twist.type.teamsLookupId === item.episode.teamsLookupId
                    : false;
                return item.episode === twist.type || equalTeamsLookupIds;
            });
            this.refreshItems(newItems, i);
        }
    }

    public componentDidMount() {
        twistCapacity$.next(this.maxCapacity());
        this.subs.push(twist$.subscribe((twist) => this.addRemoveTwist(twist)));
    }

    public componentWillUnmount(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    private refreshItems(newItems: SeasonEditorListItem[], addIndex?: number) {
        const finalItems = [];
        let week: number = 0;
        let playerCount: number = this.props.castSize;
        let i = 0;
        for (const item of newItems) {
            const doNotIncrement = i - 1 > 0 && !!newItems[i - 1].episode.pseudo;
            const chainable: boolean = !!item.episode.chainable;
            // FIXME: playerCount !== this.props.castSize // may become invalid when we do battlebacks
            // because you could have a battleback to maxplayers immediately into a double eviction
            const isValidChain: boolean = chainable ? playerCount !== this.props.castSize : true;
            const isValid = item.episode.canPlayWith(playerCount) && isValidChain;
            !chainable && !doNotIncrement && week++;
            item.weekText = `Week ${week || 1}: F${playerCount}`;
            item.isValid = isValid;
            playerCount -= item.episode.eliminates;
            // delete all vanilla big brother episodes if player count is below 3
            if (isValid || item.episode !== BigBrotherVanilla) {
                finalItems.push(item);
            }
            i++;
        }
        // if we have to add new vanilla episodes b/c we dont have enough to get to F4, add them
        if (playerCount > 3) {
            while (playerCount > 3) {
                week++;
                const item = {
                    id: (this.id++).toString(),
                    weekText: `Week ${week || 1}: F${playerCount}`,
                    episode: BigBrotherVanilla,
                    isValid: true,
                };
                if (addIndex !== undefined) {
                    finalItems.splice(addIndex, 0, item);
                } else {
                    finalItems.unshift(item);
                }
                playerCount--;
            }
            this.refreshItems(finalItems);
        }
        _items = finalItems;
        this.setState({ items: finalItems });
        this.props.setTwistsValid(finalItems.every((item) => item.isValid));
    }
    public render() {
        const onDragEnd = (result: any) => {
            if (!result.destination) {
                return;
            }
            const newItems = Array.from(this.state.items);
            const [removed] = newItems.splice(result.source.index, 1);
            newItems.splice(result.destination.index, 0, removed);
            this.refreshItems(newItems);
        };
        const items = this.state.items;
        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <ListItem provided={provided} snapshot={snapshot} item={item} />
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }
}
