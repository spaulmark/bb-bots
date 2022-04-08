import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Draggable } from "react-beautiful-dnd";
import React from "react";
import styled from "styled-components";

const DragItem = styled.div`
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    background: white;
    margin: 0 0 4px 0;
    display: grid;
    flex-direction: column;
`;

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
            <span>{`${item.weekText} | Double Eviction`}</span>
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
}

export class SeasonEditorList extends React.Component<SeasonEditorListProps, SeasonEditorListState> {
    public constructor(props: SeasonEditorListProps) {
        super(props);
        const elements: SeasonEditorListItem[] = [];
        let week: number = 0;
        for (let i = props.castSize; i > 3; i--) {
            week++;
            elements.push({ id: i.toString(), weekText: `Week ${week}: F${i}` });
        }
        this.state = { items: elements };
    }

    public render() {
        const onDragEnd = (result: any) => {
            if (!result.destination) {
                return;
            }
            const newItems = Array.from(this.state.items);
            const [removed] = newItems.splice(result.source.index, 1);
            newItems.splice(result.destination.index, 0, removed);
            let week: number = 0;
            // TODO: make it so that if your twists go off the edge of the game,
            // it just says N/A instead of "Week X: FX"
            for (let i = 0; i < this.props.castSize - 3; i++) {
                week++;
                newItems[i].weekText = `Week ${week}: F${this.props.castSize - i}`;
            }

            this.setState({ items: newItems });
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
