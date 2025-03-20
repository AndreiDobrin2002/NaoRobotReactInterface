import React, { useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const categorizedEndpoints = {
  Movement: [
    { id: "1", name: "Move", route: "/move", method: "POST" },
    { id: "14", name: "Bow", route: "/bow", method: "POST" },
    { id: "15", name: "Squat", route: "/squat", method: "POST" }
  ],
  Posture: [
    { id: "4", name: "Stand Up", route: "/stand_up", method: "POST" },
    { id: "5", name: "Sit Down", route: "/sit_down", method: "POST" },
    { id: "11", name: "Stand Zero", route: "/stand_zero", method: "POST" }
    ],
  Actions: [
    { id: "2", name: "Speak", route: "/speak", method: "POST" },
    { id: "8", name: "Hello", route: "/hello", method: "POST" },
    { id: "9", name: "Scratch Head", route: "/scratch_head", method: "POST" },
    { id: "10", name: "Headbang", route: "/headbang", method: "POST" },
    { id: "12", name: "Tai Chi", route: "/tai_chi", method: "POST" },
    { id: "13", name: "Set Eye Color", route: "/set_eye_color", method: "POST", body: { color: "#007bff" } }
  ],
  System: [
    { id: "6", name: "Rest", route: "/rest", method: "POST" },
    { id: "7", name: "Wake Up", route: "/wake_up", method: "POST" }
  ],
  Sensors: [
    { id: "3", name: "Sensors", route: "/all_sensors", method: "GET" },
    { id: "16", name: "Robot Pose", route: "/robot_pose", method: "GET" },
    { id: "17", name: "Robot Velocity", route: "/robot_velocity", method: "GET" }
  ]
};

const runOnClickEndpoints = [
  { id: "18", name: "Start Obstacle Avoidance", route: "/obstacle_avoidance", method: "POST", body: { action: "start" } },
  { id: "19", name: "Stop Obstacle Avoidance", route: "/obstacle_avoidance", method: "POST", body: { action: "stop" } },
  { id: "21", name: "Start Recording", route: "/start_recording", method: "POST" },
  { id: "22", name: "Stop Recording", route: "/stop_and_save_recording", method: "POST" },
  { id: "23", name: "Start Control Manual", route: "/manual_control/start", method: "POST" },
  { id: "24", name: "Stop Control Manual", route: "/manual_control/stop", method: "POST" },
  { id: "25", name: "Stop Music", route: "/stop_audio", method: "POST" },
];

const EndpointList = ({ setSelectedEndpoints, selectedEndpoints, setResponse }) => {
  const fileInputRef = useRef(null);
  const [openCategories, setOpenCategories] = useState({});

  const handleRunOnClick = async (endpoint) => {
    try {
      const options = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
      };
      if (endpoint.method === "POST" && endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const res = await fetch(`http://localhost:5000${endpoint.route}`, options);
      const data = await res.json();
      setResponse((prev) => prev + `\n${endpoint.name}: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResponse((prev) => prev + `\n${endpoint.name}: Error - ${error.message}`);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload_and_play", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse((prev) => prev + `\nUpload Music: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResponse((prev) => prev + `\nUpload Music: Error - ${error.message}`);
    }
  };

  return (
      <div className="left-panel">
        <div className="endpoints-container">
          <h2>Endpoints</h2>
          {Object.keys(categorizedEndpoints).map((category) => (
              <div key={category} className="category">
                <button className="category-button" onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))}>
                  <FaChevronDown className={`arrow-icon ${openCategories[category] ? "open" : ""}`} /> {category}
                </button>
                {openCategories[category] && (
                    <div className="category-content">
                      {categorizedEndpoints[category].map((endpoint) => (
                          <div key={endpoint.id} className="card" onClick={() => setSelectedEndpoints([...selectedEndpoints, endpoint])}>
                            {endpoint.name}
                          </div>
                      ))}
                    </div>
                )}
              </div>
          ))}
        </div>

        <div className="run-on-click-container">
          <h2>Run On Click</h2>
          {runOnClickEndpoints.map((endpoint) => (
              <button key={endpoint.id} className="run-button" onClick={() => handleRunOnClick(endpoint)}>
                {endpoint.name}
              </button>
          ))}

          <input type="file" accept="audio/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
          <button className="run-button" onClick={() => fileInputRef.current.click()}>Upload Music</button>
        </div>
      </div>
  );
};

export default EndpointList;