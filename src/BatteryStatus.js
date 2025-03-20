import React, { useState, useEffect } from "react";
import BatteryGauge from "react-battery-gauge";

const BatteryStatus = () => {
    const [batteryLevel, setBatteryLevel] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBattery = async () => {
            try {
                const response = await fetch("http://localhost:5000/battery");
                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setBatteryLevel(data.battery_level * 100); // Convertim în %
                }
            } catch (err) {
                setError("Eroare la preluarea datelor");
            }
        };

        fetchBattery();
        const interval = setInterval(fetchBattery, 5000); // Actualizare la fiecare 5 secunde
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ textAlign: "center", padding: "1px" }}>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <BatteryGauge
                    value={batteryLevel}
                    size={120}
                    customization={{
                        batteryBody: {
                            strokeColor: "#333",
                            strokeWidth: 4 },
                        batteryCap: {
                            strokeColor: "#333",
                            strokeWidth: 4 },
                        batteryMeter: {
                            fill: 'green',
                            lowBatteryValue: 20,
                            lowBatteryFill: 'red' },
                        readingText: {
                            lightContrastColor: "black",
                            darkContrastColor: "white",
                            lowBatteryColor: 'red',
                            fontSize: 18 },

                    }}
                />
            )}
        </div>
    );
};

export default BatteryStatus;
