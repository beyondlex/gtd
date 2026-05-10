#!/usr/bin/env bun
import { render } from "ink";
import { App } from "./app.js";

const { waitUntilExit, clear } = render(<App />, {
  exitOnCtrlC: false,
  patchConsole: false,
  alternateScreen: true,
});

process.on("SIGINT", () => {
  clear();
  process.exit(0);
});

await waitUntilExit();