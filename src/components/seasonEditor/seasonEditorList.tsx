import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Draggable } from "react-beautiful-dnd";
import React from "react";
import styled from "styled-components";
import { EpisodeType } from "../episode/episodes";
import { BigBrotherVanilla } from "../episode/bigBrotherEpisode";
import { BehaviorSubject, Subscription } from "rxjs";
import { twist$ } from "./twistAdder";
import { min } from "lodash";
import { removeFirstNMatching } from "../../utils";
import { EpisodeLibrary } from "../../model/season";

const DragItem = styled.div`
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    background: #444346;
    margin: 0 0 3px 0;
    border: 1px solid #6c6c6c;
    display: grid;
    flex-direction: column;
    color: #fff;
`;

let _items: SeasonEditorListItem[] = [];
let _castSize: number = 0;

export function getEpisodeLibrary(): EpisodeLibrary {
    const result: EpisodeLibrary = {};
    let playersRemaining = _castSize;
    for (const item of _items) {
        if (item.episode !== BigBrotherVanilla) {
            result[playersRemaining] = item.episode;
        }
        playersRemaining -= item.episode.eliminates;
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
    return (
        <DragItem
            ref={provided.innerRef}
            snapshot={snapshot}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
        >
            <span>{`${item.weekText}${
                item.episode !== BigBrotherVanilla ? ` | ${item.episode.name}` : ""
            }`}</span>
        </DragItem>
    );
};

interface SeasonEditorListProps {
    castSize: number;
}

interface SeasonEditorListState {
    items: SeasonEditorListItem[];
}

interface SeasonEditorListItem {
    id: string;
    weekText: string;
    episode: EpisodeType;
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
                (item) => item.episode === BigBrotherVanilla
            );
            newItems.unshift({
                id: (this.id++).toString(),
                weekText: `error lol`,
                episode: twist.type,
            });
            this.refreshItems(newItems);
        } else {
            // remove the first instance of the twist, and add X vanilla episodes
            const newItems = Array.from(this.state.items);
            removeFirstNMatching(newItems, 1, (item) => item.episode === twist.type);
            this.refreshItems(newItems);
        }
    }

    public componentDidMount() {
        twistCapacity$.next(this.maxCapacity());
        this.subs.push(twist$.subscribe((twist) => this.addRemoveTwist(twist)));
    }

    public componentWillUnmount(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    private refreshItems(newItems: SeasonEditorListItem[]) {
        const finalItems = [];
        let week: number = 0;
        let playerCount: number = this.props.castSize;

        for (const item of newItems) {
            const isValid = item.episode.canPlayWith(playerCount);
            if (isValid) week++;
            item.weekText = `${isValid ? `Week ${week}: F${playerCount}` : "N/A"}`;
            if (isValid) playerCount -= item.episode.eliminates;
            // delete all vanilla big brother episodes if player count is below 3
            if (isValid || item.episode !== BigBrotherVanilla) {
                finalItems.push(item);
            }
        }
        // if we have to add new vanilla episodes b/c we dont have enough to get to F4, add them
        if (playerCount > 3) {
            while (playerCount > 3) {
                week++;
                finalItems.unshift({
                    id: (this.id++).toString(),
                    weekText: `Week ${week}: F${playerCount}`,
                    episode: BigBrotherVanilla,
                });
                playerCount--;
            }
            this.refreshItems(finalItems);
        }
        _items = finalItems;
        this.setState({ items: finalItems });
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
