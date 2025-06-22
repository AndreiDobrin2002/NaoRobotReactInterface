import React, { useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {Button} from "primereact/button";

const DropZone = ({ selectedEndpoints, setSelectedEndpoints, darkMode, onClearQueue, onSaveQueue, onLoadQueue }) => {

    // Load from localStorage on mount
    useEffect(() => {
        const savedQueue = localStorage.getItem("executionQueue");
        if (savedQueue) {
            try {
                setSelectedEndpoints(JSON.parse(savedQueue));
            } catch (err) {
                console.error("Error parsing executionQueue from localStorage", err);
            }
        }
    }, [setSelectedEndpoints]);

    // Save to localStorage whenever selectedEndpoints changes
    useEffect(() => {
        localStorage.setItem("executionQueue", JSON.stringify(selectedEndpoints));
    }, [selectedEndpoints]);

    const onRowReorder = (event) => {
        setSelectedEndpoints(event.value);
    };

    const handleRemove = (index) => {
        setSelectedEndpoints((prev) => prev.filter((_, i) => i !== index));
    };

    const handleInputChange = (index, field, value) => {
        setSelectedEndpoints((prev) =>
            prev.map((endpoint, i) =>
                i === index ? { ...endpoint, body: { ...endpoint.body, [field]: value } } : endpoint
            )
        );
    };

    return (
        <div className={`right-panel ${darkMode ? "dark-mode" : ""}`}>
            <div className="execution-header">
                <h2>Execution Queue</h2>
                <div className="queue-buttons">
                    <Button
                        icon="pi pi-eraser"
                        rounded
                        severity="warning"
                        className="clear-queue"
                        onClick={onClearQueue}
                        disabled={selectedEndpoints.length === 0}
                    />
                    <Button
                        icon="pi pi-save"
                        rounded
                        severity="info"
                        className="save-queue"
                        onClick={onSaveQueue}
                        disabled={selectedEndpoints.length === 0}
                    />
                    <Button
                        icon="pi pi-folder-open"
                        rounded
                        severity="help"
                        className="load-queue"
                        onClick={onLoadQueue}
                    />
                </div>
            </div>
                <DataTable value={selectedEndpoints} reorderableRows onRowReorder={onRowReorder} className="p-datatable-sm">
                <Column rowReorder style={{width: '3rem'}}/>
                <Column header="Action" body={(rowData, {rowIndex}) => (
                    <div className="queue-item">
                        <button className="remove-btn" onClick={() => handleRemove(rowIndex)}>×</button>
                        <span className="endpoint-name">{rowData.name}</span>

                        {rowData.name === "Move" && (
                            <div className="input-group">
                                <select value={rowData.body?.direction || ""} onChange={(e) => handleInputChange(rowIndex, "direction", e.target.value)}>
                                    <option value="">Select Direction</option>
                                    <option value="forward">Forward</option>
                                    <option value="backward">Backward</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                                <input type="number" placeholder="Distance" value={rowData.body?.distance || ""} onChange={(e) => handleInputChange(rowIndex, "distance", parseFloat(e.target.value) || 0)} />
                            </div>
                        )}

                        {rowData.name === "Speak" && (
                            <div className="input-group">
                                <input type="text" placeholder="Enter text to speak" value={rowData.body?.text || ""} onChange={(e) => handleInputChange(rowIndex, "text", e.target.value)} />
                            </div>
                        )}

                        {rowData.name === "Ask" && (
                            <div className="input-group">
                                <input type="text" placeholder="Enter question to ask" value={rowData.body?.question || ""} onChange={(e) => handleInputChange(rowIndex, "question", e.target.value)} />
                            </div>
                        )}

                        {rowData.name === "Set Eye Color" && (
                            <div className="input-group">
                                <select value={rowData.body?.eye || ""} onChange={(e) => handleInputChange(rowIndex, "eye", e.target.value)}>
                                    <option value="">Select Eye</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                    <option value="both">Both</option>
                                </select>
                                <input type="color" value={rowData.body?.color || ""} onChange={(e) => handleInputChange(rowIndex, "color", e.target.value)} />
                            </div>
                        )}

                        {rowData.name === "Squat" && (
                            <div className="input-group">
                                <input type="number" placeholder="Repetitions" value={rowData.body?.repetitions || ""} onChange={(e) => handleInputChange(rowIndex, "repetitions", parseInt(e.target.value) || 0)} />
                            </div>
                        )}

                        {rowData.name === "Upload Music" && (
                            <div className="input-group">
                                <input type="text" placeholder="Enter URL" value={rowData.body?.url || ""} onChange={(e) => handleInputChange(rowIndex, "url", e.target.value)} />
                            </div>
                        )}
                    </div>
                )} />
            </DataTable>
        </div>
    );
};

export default DropZone;
