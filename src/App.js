import React, { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "primereact/button";
import { Knob } from "primereact/knob";
import EndpointList from "./EndpointList";
import DropZone from "./DropZone";
import BatteryStatus from "./BatteryStatus";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

function App() {
  const [selectedEndpoints, setSelectedEndpoints] = useState(() => {
    const saved = localStorage.getItem("executionQueue");
    return saved ? JSON.parse(saved) : [];
  });

  const [response, setResponse] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [volume, setVolume] = useState(50);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const stopExecutionRef = useRef(false);

  useEffect(() => {
    localStorage.setItem("executionQueue", JSON.stringify(selectedEndpoints));
  }, [selectedEndpoints]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchVolume = async () => {
      try {
        const response = await fetch("http://localhost:5000/get_volume");
        if (response.ok) {
          const data = await response.json();
          setVolume(data.volume);
        } else {
          console.error("Eroare la obținerea volumului.");
        }
      } catch (error) {
        console.error("Eroare de rețea:", error);
      }
    };

    fetchVolume();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    stopExecutionRef.current = false;

    for (const endpoint of selectedEndpoints) {
      if (stopExecutionRef.current) break;
      try {
        const options = {
          method: endpoint.method,
          headers: { "Content-Type": "application/json" },
        };
        if (endpoint.method === "POST")
          options.body = JSON.stringify(endpoint.body || {});

        const res = await fetch(`http://localhost:5000${endpoint.route}`, options);
        const data = await res.json();
        setResponse((prev) => prev + `\n${endpoint.name}: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        setResponse((prev) => prev + `\n${endpoint.name}: Error - ${error.message}`);
      }
    }
    setIsExecuting(false);
  };

  const handleStop = async () => {
    stopExecutionRef.current = true;
    setIsExecuting(false);

    try {
      await fetch("http://localhost:5000/stop_all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Mișcările și sunetele au fost oprite.");
    } catch (error) {
      console.error("Eroare la apelarea stop_all:", error);
    }
  };

  const updateRobotVolume = async (newVolume) => {
    try {
      const response = await fetch("http://localhost:5000/set_volume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ volume: newVolume }),
      });

      if (response.ok) {
        console.log(`Volumul robotului setat la ${newVolume}`);
      } else {
        console.error("Eroare la setarea volumului.");
      }
    } catch (error) {
      console.error("Eroare de rețea:", error);
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(e.value);
    updateRobotVolume(e.value);
  };

  const handleClearQueue = () => {
    setSelectedEndpoints([]);
    localStorage.removeItem("executionQueue");
  };

  const handleSaveQueueToFile = () => {
    const filename = prompt("Introduceți un nume pentru fișierul salvat:", "executionQueue");

    if (!filename) return; // utilizatorul a apăsat Anulează

    const blob = new Blob([JSON.stringify(selectedEndpoints, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleLoadQueueFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loadedQueue = JSON.parse(event.target.result);
          if (Array.isArray(loadedQueue)) {
            setSelectedEndpoints(loadedQueue);
          } else {
            alert("Invalid file format");
          }
        } catch (error) {
          alert("Failed to load file");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };


  return (
      <DndProvider backend={HTML5Backend}>
        <div className="header">
          <div className="battery-header">
            <BatteryStatus />
            <Knob
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={100}
                step={1}
                size={80}
                showValue={true}
                valueTemplate="{value}%"
            />
          </div>
          <div className="title-container">
            <h1 className="title">Robot Control</h1>
          </div>
          <div className="execute-button">
            <Button
                icon={theme === "light" ? "pi pi-moon" : "pi pi-sun"}
                severity="secondary"
                className="theme-toggle"
                onClick={toggleTheme}
                rounded
            />
            <Button
                icon="pi pi-play-circle"
                rounded
                severity="success"
                className="execute"
                onClick={handleExecute}
                disabled={selectedEndpoints.length === 0 || isExecuting}
            />
            <Button
                icon="pi pi-stop-circle"
                rounded
                severity="danger"
                className="danger"
                aria-label="Cancel"
                onClick={handleStop}
                disabled={!isExecuting}
            />
          </div>
        </div>
        <div className="app-container">
          <EndpointList
              setSelectedEndpoints={setSelectedEndpoints}
              selectedEndpoints={selectedEndpoints}
              setResponse={setResponse}
          />
          <DropZone
              selectedEndpoints={selectedEndpoints}
              setSelectedEndpoints={setSelectedEndpoints}
              darkMode={theme === "dark"}
              onClearQueue={handleClearQueue}
              onSaveQueue={handleSaveQueueToFile}
              onLoadQueue={handleLoadQueueFromFile}
          />

          <div className="robot-camera-container">
            <div className="robot-camera-stream">
              <h2>Robot Camera</h2>
              <img
                  src="http://localhost:5000/stream_camera"
                  alt="Robot Camera Stream"
                  className="robot-camera"
              />
            </div>
            <div className="robot-response">
              <h2>Execution Response</h2>
              <pre>{response}</pre>
            </div>
          </div>
        </div>
      </DndProvider>
  );
}

export default App;
