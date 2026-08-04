const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "shared", "types.ts");
const targets = [
  path.join(root, "app", "src", "shared", "types.ts"),
  path.join(root, "server", "shared", "types.ts"),
];

const content = fs.readFileSync(source, "utf8");
for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

console.log(`Synced shared/types.ts -> ${targets.length} target(s)`);
