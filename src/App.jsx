import { useState } from "react";
import "./App.css";
import Canvas from "./Canvas";
import { Slider } from "baseui/slider";

function App() {
  const [count, setCount] = useState(0);
  const [xspeed, setXspeed] = useState([1]);

  return (
    <div className="App">
      <h1>Vite + React</h1>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>

      <Slider
        value={xspeed}
        onChange={({ value }) => value && setXspeed(value)}
        min={-5}
        max={5}
      />

      <Canvas xspeed={xspeed[0]} />
    </div>
  );
}

export default App;
