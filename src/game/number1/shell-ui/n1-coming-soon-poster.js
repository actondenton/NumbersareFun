/**
 * Shared "coming soon" placeholder poster HTML for shell page panels.
 *
 * @param {string} heading
 * @param {string} bodyHtml
 */
export function renderComingSoonPoster(heading, bodyHtml) {
    return "<div class=\"coming-soon-poster\" role=\"status\">" +
        "<div class=\"coming-soon-poster-ribbon\" aria-hidden=\"true\">Coming soon</div>" +
        "<h4 class=\"coming-soon-poster-title\">" + heading + "</h4>" +
        "<div class=\"coming-soon-poster-body\">" + bodyHtml + "</div></div>";
}
