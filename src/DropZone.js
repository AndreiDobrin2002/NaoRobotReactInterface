import React from "react";
import { useDrop, useDrag } from "react-dnd";

const DropZone = ({ selectedEndpoints, setSelectedEndpoints, darkMode }) => {
    const [, drop] = useDrop({
        accept: "ENDPOINT",
        hover: (item, monitor) => {
            const fromIndex = item.index;
            const toIndex = getItemIndex(monitor.getClientOffset());

            if (fromIndex === toIndex) return;

            moveItem(fromIndex, toIndex);
            item.index = toIndex;
        },
    });

    const getItemIndex = (clientOffset) => {
        const clientY = clientOffset?.y || 0;
        return Math.floor(clientY / 90);
    };

    const handleRemove = (index) => {
        setSelectedEndpoints((prev) => prev.filter((_, i) => i !== index));
    };

    const moveItem = (fromIndex, toIndex) => {
        setSelectedEndpoints((prev) => {
            const updated = [...prev];
            const [movedItem] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, movedItem);
            return updated;
        });
    };

    const handleInputChange = (index, field, value) => {
        setSelectedEndpoints((prev) =>
            prev.map((endpoint, i) =>
                i === index ? { ...endpoint, body: { ...endpoint.body, [field]: value } } : endpoint
            )
        );
    };

    return (
        <div ref={drop} className={`right-panel ${darkMode ? "dark-mode" : ""}`}>
            <h2>Execution Queue</h2>
            {selectedEndpoints.map((endpoint, index) => {
                if (!endpoint || !endpoint.id) {
                    console.warn("Invalid endpoint:", endpoint);
                    return null;
                }
                return (
                    <DraggableEndpoint
                        key={endpoint.id}
                        endpoint={endpoint}
                        index={index}
                        moveItem={moveItem}
                        handleRemove={handleRemove}
                        handleInputChange={handleInputChange}
                        darkMode={darkMode}
                    />
                );
            })}
        </div>
    );
};

const DraggableEndpoint = ({ endpoint, index, moveItem, handleRemove, handleInputChange, darkMode }) => {
    const [{ isDragging }, drag] = useDrag({
        type: "ENDPOINT",
        item: { index, endpoint },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div ref={drag} className={`queue-item ${darkMode ? "dark-mode" : ""} ${isDragging ? "dragging" : ""}`}>
            <button className="remove-btn" onClick={() => handleRemove(index)}>×</button>
            <span className="endpoint-name">{endpoint.name}</span>

            {endpoint.name === "Move" && (
                <div className="input-group">
                    <select value={endpoint.body?.direction || ""} onChange={(e) => handleInputChange(index, "direction", e.target.value)}>
                        <option value="">Select Direction</option>
                        <option value="forward">Forward</option>
                        <option value="backward">Backward</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                    </select>
                    <input type="number" placeholder="Distance" value={endpoint.body?.distance || ""} onChange={(e) => handleInputChange(index, "distance", parseFloat(e.target.value) || 0)} />
                </div>
            )}

            {endpoint.name === "Speak" && (
                <div className="input-group">
                    <input type="text" placeholder="Enter text to speak" value={endpoint.body?.text || ""} onChange={(e) => handleInputChange(index, "text", e.target.value)} />
                </div>
            )}

            {endpoint.name === "Set Eye Color" && (
                <div className="input-group">
                    <select value={endpoint.body?.eye || ""} onChange={(e) => handleInputChange(index, "eye", e.target.value)}>
                        <option value="">Select Eye</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="both">Both</option>
                    </select>
                    <input type="color" value={endpoint.body?.color || ""} onChange={(e) => handleInputChange(index, "color", e.target.value)} />
                </div>
            )}

            {endpoint.name === "Squat" && (
                <div className="input-group">
                    <input type="number" placeholder="Repetitions" value={endpoint.body?.repetitions || ""} onChange={(e) => handleInputChange(index, "repetitions", parseInt(e.target.value) || 0)} />
                </div>
            )}

            {endpoint.name === "Upload Music" && (
                <div className="input-group">
                    <input type="text" placeholder="Enter URL" value={endpoint.body?.url || ""} onChange={(e) => handleInputChange(index, "url", e.target.value)} />
                </div>
            )}
        </div>
    );
};

export default DropZone;
