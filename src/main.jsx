import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, LightTheme } from "baseui";

const engine = new Styletron();

ReactDOM.createRoot(document.getElementById("root")).render(
  <StyletronProvider value={engine}>
    <BaseProvider theme={LightTheme}>
      <App />
    </BaseProvider>
  </StyletronProvider>
);
