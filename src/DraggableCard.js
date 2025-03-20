import React from "react";
import { useDrag } from "react-dnd";

const DraggableCard = ({ endpoint }) => {
    const [{ isDragging }, drag] = useDrag({
        type: "ENDPOINT",
        item: { endpoint },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div ref={drag} className="card" style={{ opacity: isDragging ? 0.5 : 1 }}>
            {endpoint.name}
        </div>
    );
};

export default DraggableCard;
