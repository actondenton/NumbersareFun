/**
 * Real-time projected 4D hypercube (wireframe) for Phase 1 mass accumulator visuals.
 * Ported from a pinhole 4D→2D pipeline; geometry only — colors come from CSS variables on the host.
 */

const TWO_PI = Math.PI * 2;

/**
 * Model radius vs min(canvas width, height). Lower = more zoomed out so the full 4D rotation
 * stays inside the canvas (was 1.35 — too tight / clipped at the edges).
 */
const PHASE1_TESSERACT_EDGE_MULT = 0.66;
const PHASE1_TESSERACT_EDGE_MIN = 32;

/** Legacy base angular velocities (rad/s) before mass-linked scaling. */
const PHASE1_TESSERACT_BASE_RY_PER_SEC = 0.012 * 60;
const PHASE1_TESSERACT_BASE_RW_PER_SEC = 0.01 * 60;
/** At 0 Phase 1 mass fill: 10× slower than legacy base. */
const PHASE1_TESSERACT_SPEED_EMPTY = 0.1;
/** At full Phase 1 mass (35k Essence): 10× faster than legacy base. */
const PHASE1_TESSERACT_SPEED_FULL = 10;

/** Re-resolve stroke only: `--asc-p1-mass-fill` is read every paint so spin speed tracks the bar. */
const PHASE1_TESS_STROKE_CACHE_MS = 800;

const Camera = {
    focalLength: 35,
    wFocalLength: 12,
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
};
Camera.z = -(Camera.focalLength ** 2);
Camera.w = -(Camera.wFocalLength ** 2);

class Vertex {
    constructor(x, y, z, w) {
        const fl = Camera.focalLength;
        this.loc = [x / fl, y / fl, z / fl, w / fl];
        this.ploc = [0, 0];
    }

    rotate(xr, yr, zr, wr) {
        const yy = this.loc[1];
        this.loc[1] = yy * Math.cos(wr) - this.loc[3] * Math.sin(wr);
        this.loc[3] = yy * Math.sin(wr) + this.loc[3] * Math.cos(wr);
        const x = this.loc[0];
        const y = this.loc[1];
        const z = this.loc[2];
        const sx = Math.sin(xr);
        const sy = Math.sin(yr);
        const sz = Math.sin(zr);
        const cx = Math.cos(xr);
        const cy = Math.cos(yr);
        const cz = Math.cos(zr);
        const eq1 = sz * y + cz * x;
        const eq2 = cz * y - sz * x;
        const eq3 = cy * z + sy * eq1;
        this.loc[0] = cy * eq1 - sy * z;
        this.loc[1] = sx * eq3 + cx * eq2;
        this.loc[2] = cx * eq3 - sx * eq2;
    }

    project() {
        this.loc[3] -= Camera.w / Camera.wFocalLength;
        this.loc[0] = (-this.loc[0] / this.loc[3]) * Camera.wFocalLength;
        this.loc[1] = (-this.loc[1] / this.loc[3]) * Camera.wFocalLength;
        this.loc[2] = (-this.loc[2] / this.loc[3]) * Camera.wFocalLength;
        let x = this.loc[0] - Camera.x / Camera.focalLength;
        let y = this.loc[1] - Camera.y / Camera.focalLength;
        let z = this.loc[2] - Camera.z / Camera.focalLength;
        const sx = Math.sin(Camera.rotX);
        const sy = Math.sin(Camera.rotY);
        const sz = Math.sin(Camera.rotZ);
        const cx = Math.cos(Camera.rotX);
        const cy = Math.cos(Camera.rotY);
        const cz = Math.cos(Camera.rotZ);
        const eq1 = sz * y + cz * x;
        const eq2 = cz * y - sz * x;
        const eq3 = cy * z + sy * eq1;
        const dx = cy * eq1 - sy * z;
        const dy = sx * eq3 + cx * eq2;
        const dz = cx * eq3 - sx * eq2;
        const f = Camera.focalLength;
        this.ploc[0] = (f / dz) * dx * f;
        this.ploc[1] = (f / dz) * dy * f;
    }
}

class Face {
    constructor(v1, v2, v3, v4) {
        this.vertices = [v1, v2, v3, v4];
    }

    show(ctx) {
        const vs = this.vertices;
        if (!vs || vs.length < 4) return;
        const p0 = vs[0].ploc;
        const p1 = vs[1].ploc;
        const p2 = vs[2].ploc;
        const p3 = vs[3].ploc;
        if (
            !p0.length ||
            !p1.length ||
            !p2.length ||
            !p3.length ||
            ![p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]].every(n => Number.isFinite(n))
        ) {
            return;
        }
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.closePath();
        ctx.stroke();
    }
}

/**
 * Reset model-space normalized coords (before rotate/project) for an edge length.
 * @param {Vertex[]} v
 * @param {number} edge
 */
function reseedVertices(v, edge) {
    const w = edge;
    const h = w * 0.5;
    const fl = Camera.focalLength;
    const m = [
        [-h, h, -h, h],
        [h, h, -h, h],
        [h, h, h, h],
        [-h, h, h, h],
        [-h, -h, -h, h],
        [h, -h, -h, h],
        [h, -h, h, h],
        [-h, -h, h, h],
        [-h, h, -h, -h],
        [h, h, -h, -h],
        [h, h, h, -h],
        [-h, h, h, -h],
        [-h, -h, -h, -h],
        [h, -h, -h, -h],
        [h, -h, h, -h],
        [-h, -h, h, -h],
    ];
    for (let i = 0; i < 16; i++) {
        const c = m[i];
        const vi = v[i];
        vi.loc[0] = c[0] / fl;
        vi.loc[1] = c[1] / fl;
        vi.loc[2] = c[2] / fl;
        vi.loc[3] = c[3] / fl;
    }
}

/**
 * @returns {{ vertices: Vertex[], faces: Face[] }}
 */
function createTesseractGeometry() {
    const v = [];
    for (let i = 0; i < 16; i++) v[i] = new Vertex(0, 0, 0, 0);
    const faces = [
        new Face(v[0], v[1], v[2], v[3]),
        new Face(v[4], v[7], v[6], v[5]),
        new Face(v[0], v[4], v[5], v[1]),
        new Face(v[2], v[6], v[7], v[3]),
        new Face(v[8], v[9], v[10], v[11]),
        new Face(v[12], v[15], v[14], v[13]),
        new Face(v[8], v[12], v[13], v[9]),
        new Face(v[10], v[14], v[15], v[11]),
        new Face(v[0], v[1], v[9], v[8]),
        new Face(v[2], v[3], v[11], v[10]),
        new Face(v[4], v[7], v[15], v[12]),
        new Face(v[6], v[5], v[13], v[14]),
    ];
    return { vertices: v, faces };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cssW
 * @param {number} cssH
 * @param {number} rx
 * @param {number} ry
 * @param {number} rz
 * @param {number} rw
 * @param {{ vertices: Vertex[], faces: Face[] }} geom
 */
function drawTesseractFrame(ctx, cssW, cssH, rx, ry, rz, rw, geom) {
    const minDim = Math.min(cssW, cssH);
    const edge = Math.max(PHASE1_TESSERACT_EDGE_MIN, minDim * PHASE1_TESSERACT_EDGE_MULT);
    const v = geom.vertices;
    reseedVertices(v, edge);
    const spin = Math.abs(rx) + Math.abs(ry) + Math.abs(rz) + Math.abs(rw) > 0;
    for (let i = 0; i < v.length; i++) {
        if (spin) v[i].rotate(rx, ry, rz, rw);
        v[i].project();
    }
    const faces = geom.faces;
    for (let i = 0; i < faces.length; i++) faces[i].show(ctx);
}

/** @type {Set<Element>} */
const hosts = new Set();
/** @type {WeakMap<Element, { ry: number, rw: number, lastMs: number, intersecting: boolean, styleReadAt?: number, styleSizeKey?: string, cachedStroke?: string }>} */
const motionByHost = new WeakMap();
/** @type {WeakMap<Element, { vertices: Vertex[], faces: Face[] }>} */
const geoByHost = new WeakMap();

/** @type {IntersectionObserver | null} */
let hostIo = null;

let rafId = 0;
let reduceMotion = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

if (typeof matchMedia !== "undefined") {
    try {
        matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", e => {
            reduceMotion = e.matches;
        });
    } catch (_) {
        matchMedia("(prefers-reduced-motion: reduce)").addListener(e => {
            reduceMotion = e.matches;
        });
    }
}

if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) ensureRunning();
    });
}

/**
 * Whether to keep a requestAnimationFrame loop alive. Uses only cheap signals: tab visibility +
 * IntersectionObserver. Avoid checkVisibility here — it forces style/layout work every frame and
 * was starving the main thread (choppy canvas + sluggish UI).
 */
function shouldKeepRafAlive() {
    if (typeof document !== "undefined" && document.hidden) return false;
    for (const hostEl of hosts) {
        if (!hostEl || !hostEl.isConnected) continue;
        const st = motionByHost.get(hostEl);
        if (st && st.intersecting === false) continue;
        if (!isHostEligibleToPaint(hostEl)) continue;
        return true;
    }
    return false;
}

/** Play-stage hosts only paint while Phase 1 mood class is on; panel hosts always may paint. */
function isHostEligibleToPaint(hostEl) {
    if (!hostEl || typeof hostEl.closest !== "function") return true;
    const stageRoot = hostEl.closest("#number1-stage-root");
    if (!stageRoot) return true;
    return stageRoot.classList.contains("bh-phase1-vfx");
}

function observeHost(hostEl) {
    if (typeof IntersectionObserver === "undefined") return;
    if (!hostIo) {
        hostIo = new IntersectionObserver(
            entries => {
                for (let i = 0; i < entries.length; i++) {
                    const e = entries[i];
                    const st = motionByHost.get(e.target);
                    if (st) st.intersecting = e.isIntersecting;
                }
                ensureRunning();
            },
            { root: null, threshold: 0, rootMargin: "40px" }
        );
    }
    hostIo.observe(hostEl);
}

function unobserveHost(hostEl) {
    if (hostEl && hostIo) hostIo.unobserve(hostEl);
}

function readMassFill(hostEl) {
    try {
        const raw = getComputedStyle(hostEl).getPropertyValue("--asc-p1-mass-fill").trim();
        const fill = parseFloat(raw);
        if (Number.isFinite(fill)) return Math.max(0, Math.min(1, fill));
    } catch (_) {
        /* ignore */
    }
    return 0;
}

function readStroke(hostEl) {
    try {
        const raw = getComputedStyle(hostEl).getPropertyValue("--asc-p1-tesseract-stroke").trim();
        if (raw) return raw;
    } catch (_) {
        /* ignore */
    }
    return "rgba(255, 245, 220, 0.88)";
}

function paintHost(hostEl) {
    let canvas = hostEl.querySelector(":scope > canvas.asc-black-hole__tesseract-canvas");
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;

    const cssW = hostEl.clientWidth;
    const cssH = hostEl.clientHeight;
    if (cssW < 2 || cssH < 2) return;

    const dpr = Math.min(2, typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1);
    const pixW = Math.max(1, Math.floor(cssW * dpr));
    const pixH = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== pixW || canvas.height !== pixH) {
        canvas.width = pixW;
        canvas.height = pixH;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    let st = motionByHost.get(hostEl);
    if (!st) {
        st = { ry: 0, rw: 0, lastMs: now, intersecting: true };
        motionByHost.set(hostEl, st);
    }
    const dt = Math.min(0.08, Math.max(0, (now - st.lastMs) / 1000));
    st.lastMs = now;

    const fill = readMassFill(hostEl);

    const sizeKey = pixW + "x" + pixH;
    const needStroke =
        st.styleReadAt == null ||
        now - st.styleReadAt >= PHASE1_TESS_STROKE_CACHE_MS ||
        st.styleSizeKey !== sizeKey;
    let stroke;
    if (needStroke) {
        stroke = readStroke(hostEl);
        st.cachedStroke = stroke;
        st.styleReadAt = now;
        st.styleSizeKey = sizeKey;
    } else {
        stroke = st.cachedStroke ?? readStroke(hostEl);
    }
    const speedMult =
        PHASE1_TESSERACT_SPEED_EMPTY + fill * (PHASE1_TESSERACT_SPEED_FULL - PHASE1_TESSERACT_SPEED_EMPTY);

    if (!reduceMotion) {
        st.ry = (st.ry - PHASE1_TESSERACT_BASE_RY_PER_SEC * speedMult * dt + TWO_PI * 4) % TWO_PI;
        st.rw = (st.rw - PHASE1_TESSERACT_BASE_RW_PER_SEC * speedMult * dt + TWO_PI * 4) % TWO_PI;
    }

    const rx = 0;
    const rz = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pixW, pixH);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(cssW / 2, cssH / 2);

    const minDim = Math.min(cssW, cssH);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(0.65, minDim / 100);
    ctx.lineJoin = "round";
    ctx.globalAlpha = 1;

    let geom = geoByHost.get(hostEl);
    if (!geom) {
        geom = createTesseractGeometry();
        geoByHost.set(hostEl, geom);
    }
    drawTesseractFrame(ctx, cssW, cssH, rx, st.ry, rz, st.rw, geom);
}

function frame() {
    rafId = 0;
    if (typeof document !== "undefined" && document.hidden) return;

    for (const hostEl of [...hosts]) {
        if (!hostEl || !hostEl.isConnected) {
            unobserveHost(hostEl);
            hosts.delete(hostEl);
            continue;
        }
        const st = motionByHost.get(hostEl);
        if (st && st.intersecting === false) continue;
        if (!isHostEligibleToPaint(hostEl)) continue;
        paintHost(hostEl);
    }

    if (hosts.size > 0 && shouldKeepRafAlive()) {
        rafId = requestAnimationFrame(frame);
    }
}

function ensureRunning() {
    if (rafId) return;
    if (typeof document !== "undefined" && document.hidden) return;
    if (hosts.size === 0 || !shouldKeepRafAlive()) return;
    rafId = requestAnimationFrame(frame);
}

/**
 * Attach a canvas under `.asc-black-hole__tesseract` and drive the animation loop.
 * @param {Element | null | undefined} hostEl
 */
export function mountPhase1TesseractCanvas(hostEl) {
    if (!hostEl) return;
    let canvas = hostEl.querySelector(":scope > canvas.asc-black-hole__tesseract-canvas");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "asc-black-hole__tesseract-canvas";
        canvas.setAttribute("aria-hidden", "true");
        hostEl.appendChild(canvas);
    }
    if (!motionByHost.has(hostEl)) {
        const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
        motionByHost.set(hostEl, { ry: 0, rw: 0, lastMs: nowMs, intersecting: true });
    }
    hosts.add(hostEl);
    observeHost(hostEl);
    ensureRunning();
    requestAnimationFrame(() => {
        const st = motionByHost.get(hostEl);
        if (st && st.intersecting === false) return;
        if (!isHostEligibleToPaint(hostEl)) return;
        paintHost(hostEl);
    });
}

/**
 * Stop RAF for a host and remove its canvas.
 * @param {Element | null | undefined} hostEl
 */
export function unmountPhase1TesseractCanvas(hostEl) {
    if (!hostEl) return;
    unobserveHost(hostEl);
    hosts.delete(hostEl);
    motionByHost.delete(hostEl);
    geoByHost.delete(hostEl);
    const canvas = hostEl.querySelector(":scope > canvas.asc-black-hole__tesseract-canvas");
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
}

/**
 * Sync all tesseract hosts under `root` (ascension panel + play stage).
 * @param {ParentNode | null | undefined} root
 */
export function syncPhase1TesseractCanvasesInRoot(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll(".asc-black-hole__tesseract").forEach(el => mountPhase1TesseractCanvas(el));
}

/**
 * Dispose all tesseract canvases under `root` (leave Phase 1 / hide stage).
 * @param {ParentNode | null | undefined} root
 */
export function disposePhase1TesseractCanvasesInRoot(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll(".asc-black-hole__tesseract").forEach(el => unmountPhase1TesseractCanvas(el));
}

/**
 * Sync Phase 1 mass fill onto geometry hosts for tesseract spin speed and CSS effects.
 * @param {ParentNode | null | undefined} root
 * @param {number} fillRatio
 */
export function syncPhase1MassFillCssVarsInRoot(root, fillRatio) {
    if (!root || !root.querySelectorAll) return;
    const fill = Math.max(0, Math.min(1, Number(fillRatio) || 0));
    const s = fill.toFixed(8);
    root.querySelectorAll(".asc-black-hole__mass-geometry").forEach(function (el) {
        if (el && el.style && typeof el.style.setProperty === "function") {
            el.style.setProperty("--asc-p1-mass-fill", s);
        }
    });
}
