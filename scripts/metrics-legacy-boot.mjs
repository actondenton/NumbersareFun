/**
 * Rough line split for legacy-boot.js (no Perl / cloc dependency on Windows).
 * Counts non-empty lines; treats whole-line // and * block markers as comment-only.
 * Inline code + trailing comments count as code (good enough for trend tracking).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const file = path.join(root, "src", "game", "legacy-boot.js");
const text = fs.readFileSync(file, "utf8");
let code = 0;
let commentOnly = 0;
let blank = 0;
let inBlock = false;
for (const line of text.split(/\n/)) {
    const t = line.trim();
    if (!t) {
        blank++;
        continue;
    }
    if (inBlock) {
        commentOnly++;
        if (t.includes("*/")) inBlock = false;
        continue;
    }
    if (t.startsWith("/*")) {
        commentOnly++;
        if (!t.includes("*/")) inBlock = true;
        continue;
    }
    if (t.startsWith("//") || t.startsWith("*")) {
        commentOnly++;
        continue;
    }
    code++;
}
console.log(JSON.stringify({ file: "src/game/legacy-boot.js", code, commentOnly, blank, total: code + commentOnly + blank }, null, 2));
