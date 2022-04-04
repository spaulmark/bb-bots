import { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Draggable } from "react-beautiful-dnd";
import React from "react";
import styled from "styled-components";

const DragItem = styled.div`
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    background: white;
    margin: 0 0 8px 0;
    display: grid;
    grid-gap: 20px;
    flex-direction: column;
`;

const ListItem = ({ item, provided, snapshot }: { item: any; provided: any; snapshot: any }): JSX.Element => {
    return (
        <DragItem
            ref={provided.innerRef}
            snapshot={snapshot}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
        >
            <span>{item.id}</span>
        </DragItem>
    );
};

const elements = [
    { id: "one", content: "one" },
    { id: "two", content: "two" },
    { id: "three", content: "three" },
    { id: "four", content: "four" },
];

export function SeasonEditorPage() {
    const [items, setItems] = useState(elements);

    const onDragEnd = (result: any) => {
        if (!result.destination) {
            return;
        }
        const newItems = Array.from(items);
        const [removed] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, removed);
        setItems(newItems);
    };

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
