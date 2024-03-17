import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Draggable } from "react-beautiful-dnd";
import React from "react";
import styled from "styled-components";
import { EpisodeType } from "../episode/episodes";
import { BigBrotherVanilla } from "../episode/bigBrotherEpisode";
import { BehaviorSubject, Subscription } from "rxjs";
import { getEmoji, twist$ } from "./twistAdder";
import { min } from "lodash";
import { removeFirstNMatching, removeLast1Matching } from "../../utils";
import { GameState, getById } from "../../model/gameState";
import _ from "lodash";

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

export let _items: { episode: EpisodeType }[] = [];
export let _castSize: number = 0;

export function deleteTeams(gameState: GameState, toDelete: Set<number>): void {
    gameState.nonEvictedHouseguests.forEach((hgid) => {
        const hg = getById(gameState, hgid);
        const tribe = hg.tribe;
        if (!tribe) return;
        if (toDelete.has(tribe.tribeId)) {
            hg.tribe = undefined;
        }
    });
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
    loadLast: boolean;
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
export const lateJoinerCapacity$ = new BehaviorSubject<number>(0);

function shouldIncrement(items: SeasonEditorListItem[], i: number): boolean {
    if (i + 1 >= items.length) return false; // there is no current item (or next item), so who cares
    const item = items[i];
    if (item.episode.pseudo) return false;
    const nextItem = items[i + 1];
    if (nextItem.episode.chainable) return false; // next is chainable
    if (!nextItem.episode.pseudo) return true; // next is normal episode
    // next is pseudo, so we need to check if there is a next next item until we find a non-pseudo
    for (let j = i + 2; j < items.length; j++) {
        const nextNextItem = items[j];
        const notPseudo = !nextNextItem.episode.pseudo;
        if (notPseudo) {
            // false for chainable, true for normal
            return !nextNextItem.episode.chainable;
        }
    }
    return false; // exhausted the list, return false
}

let lastState: SeasonEditorListState = { items: [] };
let id = 0;

export class SeasonEditorList extends React.Component<SeasonEditorListProps, SeasonEditorListState> {
    private subs: Subscription[] = [];

    public constructor(props: SeasonEditorListProps) {
        super(props);
        _castSize = props.castSize;
        const elements: SeasonEditorListItem[] = [];
        let week: number = 0;
        for (let i = props.castSize; i > 3; i--) {
            week++;
            elements.push({
                id: (id++).toString(),
                weekText: `Week ${week}: F${i}`,
                episode: BigBrotherVanilla,
                isValid: true,
            });
        }
        !props.loadLast && (_items = elements);
        this.state = props.loadLast ? lastState : { items: elements };
    }

    private maxCapacity(): number {
        const magicFinalistsNumber = 3; // FIXME: magic number for finale
        return this.props.castSize - magicFinalistsNumber; // FIXME: magic number for finale or something
    }

    private maxLateJoinerCapacity(): number {
        const magicFinalistsNumber = 3; // FIXME: magic number for finale
        return this.props.castSize - magicFinalistsNumber - 2;
    }

    private updateTwistCapacity(newCapacity: number, subject: BehaviorSubject<number>) {
        subject.next(newCapacity);
    }

    private addRemoveTwist(twist: { type: EpisodeType; add: boolean }) {
        if (twist.type.name === "Late Joiner") {
            this.updateTwistCapacity(
                twist.add
                    ? min([
                          lateJoinerCapacity$.value - -twist.type.eliminates,
                          this.maxLateJoinerCapacity(),
                      ]) || 0
                    : lateJoinerCapacity$.value + -twist.type.eliminates,
                lateJoinerCapacity$
            );
        } else {
            this.updateTwistCapacity(
                twist.add
                    ? min([twistCapacity$.value - twist.type.eliminates, this.maxCapacity()]) || 0
                    : twistCapacity$.value + twist.type.eliminates,
                twistCapacity$
            );
        }
        // add or remove the twist
        if (twist.add) {
            // remove X vanilla episodes, then add the twist
            const newItems = Array.from(this.state.items);
            const nonChainableInsertAt = removeFirstNMatching(
                newItems,
                twist.type.eliminates,
                (item) => item.episode === BigBrotherVanilla,
                twist.type.chainable ? 1 : 0
            );
            // if chainable, add at index 1 instead
            const chainableInsertAt = newItems.findIndex(
                (value, index, _) => index > 0 && value.episode === BigBrotherVanilla
            );
            const newItem = {
                id: (id++).toString(),
                weekText: ``,
                episode: { ...twist.type },
                isValid: true,
            };
            newItem.episode.name = twist.type.name;
            newItems.splice(twist.type.chainable ? chainableInsertAt : nonChainableInsertAt, 0, newItem);
            this.refreshItems(newItems);
        } else {
            // remove the LAST instance of the twist, and add X vanilla episodes
            const newItems = Array.from(this.state.items);
            const i = removeLast1Matching(newItems, (item) => {
                const equalTeamsLookupIds = twist.type.teamsLookupId
                    ? twist.type.teamsLookupId === item.episode.teamsLookupId
                    : false;
                return item.episode.name === twist.type.name || equalTeamsLookupIds;
            });
            this.refreshItems(newItems, i);
        }
    }

    public componentDidMount() {
        !this.props.loadLast && twistCapacity$.next(this.maxCapacity());
        !this.props.loadLast && lateJoinerCapacity$.next(this.maxLateJoinerCapacity());
        this.subs.push(twist$.subscribe((twist) => this.addRemoveTwist(twist)));
    }

    public componentWillUnmount(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
        lastState = this.state;
    }

    private refreshItems(newItems: SeasonEditorListItem[], addIndex?: number) {
        // find how much to reduce cast size by for late joiners
        let reduceBy = 0;
        for (const item of newItems) {
            reduceBy += item.episode.reduceCastSizeBy || 0;
        }
        const finalItems = [];
        let week: number = 1;
        let playerCount: number = this.props.castSize - reduceBy;
        let initialPlayerCount: number = playerCount;
        let firstItem = true;
        let i = 0;
        for (const item of newItems) {
            const increment = shouldIncrement(newItems, i);
            const chainable: boolean = !!item.episode.chainable;
            const isValidChain: boolean = chainable ? playerCount !== initialPlayerCount || !firstItem : true;
            const isValid = item.episode.canPlayWith(playerCount) && isValidChain;
            item.weekText = `Week ${week}: F${playerCount}`;
            item.isValid = isValid;
            playerCount -= item.episode.eliminates;
            // delete all vanilla big brother episodes if player count is below 3
            if (isValid || item.episode !== BigBrotherVanilla) {
                finalItems.push(item);
            }
            increment && week++;
            i++;
            firstItem = false;
        }
        // if we have to add new vanilla episodes b/c we dont have enough to get to F4, add them
        if (playerCount > 3) {
            while (playerCount > 3) {
                week++;
                const item = {
                    id: (id++).toString(),
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
        _items = _.cloneDeep(finalItems);
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
