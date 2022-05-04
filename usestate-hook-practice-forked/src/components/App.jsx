import React from "react";

function App() {
  let now = new Date().toLocaleTimeString();
  const [timeState, setTime] = React.useState(now);

  function updateTime() {
    now = new Date().toLocaleTimeString();
    setTime(now);
  }

  setInterval(updateTime, 1000);

  return (
    <div className="container">
      <h1>{timeState}</h1>
      <button onClick={updateTime}>Get Time</button>
    </div>
  );
}

export default App;
