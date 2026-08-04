#!/usr/bin/env node
// Starts the server and the Expo app together for local development.
// Usage: npm run dev  (from the repo root)
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function run(name, cwd, args) {
  const child = spawn("npm", args, { cwd, stdio: "pipe", shell: true });
  const prefix = `[${name}]`;
  child.stdout.on("data", (data) => process.stdout.write(`${prefix} ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`${prefix} ${data}`));
  return child;
}

console.log("Syncing shared/types.ts into app/ and server/...");
spawn("node", [path.join(root, "scripts", "sync-shared.js")], { stdio: "inherit" }).on("close", () => {
  const children = [
    run("server", path.join(root, "server"), ["run", "dev"]),
    run("app", path.join(root, "app"), ["run", "start"]),
  ];

  const shutdown = () => {
    for (const child of children) child.kill("SIGINT");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
});
