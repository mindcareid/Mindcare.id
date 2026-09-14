//const fs = require("fs");

const file = "prisma/schema.prisma";

let schema = fs.readFileSync(file, "utf8");

const before = schema;

// Convert multiline @relation(...) into a single line.
// Handles fields, references, onDelete, onUpdate.
schema = schema.replace(
  /@relation\(\s*fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\](?:,\s*onDelete:\s*([A-Za-z]+))?(?:,\s*onUpdate:\s*([A-Za-z]+))?\s*\)/g,
  (_, fields, references, onDelete, onUpdate) => {
    const parts = [
      `fields: [${fields.trim()}]`,
      `references: [${references.trim()}]`,
    ];

    if (onDelete) {
      parts.push(`onDelete: ${onDelete}`);
    }

    if (onUpdate) {
      parts.push(`onUpdate: ${onUpdate}`);
    }

    return `@relation(${parts.join(", ")})`;
  }
);

if (schema === before) {
  console.log("No multiline @relation() patterns found.");
} else {
  fs.writeFileSync(file, schema, "utf8");
  console.log("Multiline @relation() declarations have been converted.");
}