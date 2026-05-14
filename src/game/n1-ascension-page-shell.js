/**
 * Ascension panel: number tabs + body container. Heavy sim / map HTML comes from deps callbacks.
 *
 * @param {object} deps
 * @param {number} deps.activeTabNumber 1 | 2
 * @param {boolean} deps.number2TabsUnlocked
 * @param {() => string} deps.renderNumber1AscensionBody
 * @param {() => string} deps.renderNumber2AscensionBody
 * @param {() => string} deps.renderAscensionFallbackBody
 */
export function renderAscensionPageShellHtml(deps) {
    const { activeTabNumber, number2TabsUnlocked, renderNumber1AscensionBody, renderNumber2AscensionBody, renderAscensionFallbackBody } = deps;
    const n = activeTabNumber;
    let tabsHtml = "";
    if (number2TabsUnlocked) {
        tabsHtml =
            "<div class=\"ascension-page-tabs\" role=\"tablist\" aria-label=\"Ascension by number\">" +
            "<button type=\"button\" class=\"page-btn ascension-number-tab" + (n === 1 ? " ascension-number-tab--active" : "") + "\" data-asc-tab=\"1\" role=\"tab\" aria-selected=\"" + (n === 1 ? "true" : "false") + "\">Number 1</button>" +
            "<button type=\"button\" class=\"page-btn ascension-number-tab" + (n === 2 ? " ascension-number-tab--active" : "") + "\" data-asc-tab=\"2\" role=\"tab\" aria-selected=\"" + (n === 2 ? "true" : "false") + "\">Number 2</button>" +
            "</div>";
    }
    let body = "";
    if (n === 1) body = renderNumber1AscensionBody();
    else if (n === 2 && number2TabsUnlocked) body = renderNumber2AscensionBody();
    else body = renderAscensionFallbackBody();
    return "<div class=\"ascension-page\">" + tabsHtml + "<div class=\"ascension-page-body\">" + body + "</div></div>";
}
