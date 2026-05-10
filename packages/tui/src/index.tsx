#!/usr/bin/env bun
import { render } from "ink";
import { App } from "./app.js";
import { cleanupServices } from "./services/service-context.js";

const APP_VERSION = "0.1.0";

function printUsage(): void {
  console.log(`gtd-claude v${APP_VERSION}`);
  console.log("A Things 3-inspired GTD (Getting Things Done) terminal tool.");
  console.log("");
  console.log("Usage:");
  console.log("  gtd              Launch the terminal UI");
  console.log("  gtd --help       Show this help message");
  console.log("  gtd --version    Show version information");
}

function handleArgs(): boolean {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return false;
  }
  if (args.includes("--version") || args.includes("-v")) {
    console.log(`gtd-claude v${APP_VERSION}`);
    return false;
  }
  return true;
}

let didShutdown = false;

function shutdown(): void {
  if (didShutdown) return;
  didShutdown = true;
  cleanupServices();
}

async function main(): Promise<void> {
  if (!handleArgs()) {
    process.exit(0);
  }

  const { waitUntilExit, clear } = render(<App />, {
    exitOnCtrlC: false,
    patchConsole: false,
    alternateScreen: true,
  });

  process.on("SIGINT", () => {
    clear();
    shutdown();
    process.exit(0);
  });

  process.on("exit", () => {
    shutdown();
  });

  await waitUntilExit();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  shutdown();
  process.exit(1);
});