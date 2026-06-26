import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/game/number1/boot-number1.js");
let s = fs.readFileSync(p, "utf8");
s = s.replace(/from "\.\/number1\//g, 'from "./');
s = s.replace(/from "\.\/number2\//g, 'from "../number2/');
s = s.replace(/from "\.\/n1-state-apply\.js"/g, 'from "../n1-state-apply.js"');
s = s.replace(/from "\.\/n1-save\.js"/g, 'from "../n1-save.js"');
s = s.replace(/from "\.\/phase1-tesseract-canvas\.js"/g, 'from "../phase1-tesseract-canvas.js"');
s = s.replace(/from "\.\/core\//g, 'from "../core/');
s = s.replace(/from "\.\/shell-registry\.js"/g, 'from "../shell-registry.js"');
s = s.replace(/import \{ createNumber1Runtime \} from "\.\/state\/n1-runtime\.js";\n/, "");
s = s.replace(/import \{ collectNumber1DomRefs \} from "\.\/shell-ui\/n1-dom-refs\.js";\n/, "");
s = s.replace(/import \{ createN1Boot \} from "\.\/n1-boot\.js";\n/, "");
fs.writeFileSync(p, s);
console.log("fixed imports");
