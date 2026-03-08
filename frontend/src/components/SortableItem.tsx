"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

export function SortableItem(props: { id: string; text: string; onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="sortable-item">
            <button className="drag-handle" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </button>
            <span className="item-text">{props.text}</span>
            <button className="remove-btn" onClick={() => props.onRemove(props.id)}>
                <X size={16} />
            </button>
        </div>
    );
}
