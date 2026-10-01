// Lists every `TODO(kevin)` left in content, messages and source, so nothing
// ships unfilled. Usage: npm run todos
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["src", "messages"];
const MARKER = "TODO(kevin)";

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.(tsx?|mdx?|json)$/.test(name)) yield path;
  }
}

let count = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        // Case-study blocks Kevin has to confirm (rendered as "TODO(kevin): revisar").
        if (line.trim() === "<Review>") {
          count += 1;
          console.log(`${relative(".", file)}:${index + 1}  TODO(kevin): revisar bloco <Review>`);
          return;
        }
        // A real item has text after the colon; doc comments mentioning the marker don't.
        if (!/TODO\(kevin\):\s+\w/.test(line)) return;
        count += 1;
        const text = line.slice(line.indexOf(MARKER)).replace(/["',]+\s*$/, "");
        console.log(`${relative(".", file)}:${index + 1}  ${text}`);
      });
  }
}
console.log(`\n${count} TODO(kevin) item(s).`);
