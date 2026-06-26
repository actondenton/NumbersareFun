/**
 * Number 2 nav unlock chrome (Phase 21c).
 *
 * @param {{
 *   number2: { reconcileLockState: () => void },
 *   isNumber2Unlocked: () => boolean,
 *   updatePageButtonUnlocks: () => void
 * }} dep
 */
export function createNumber2ShellBoot(dep) {
    function reconcileNumber2LockState() {
        dep.number2.reconcileLockState();
    }

    function updateNumber2SidebarUnlockUI() {
        const btn = document.querySelector(".nav-btn[data-mode=\"2\"]");
        if (btn) {
            if (dep.isNumber2Unlocked()) {
                btn.classList.remove("nav-btn--soon");
                btn.setAttribute("aria-label", "Number 2");
                btn.removeAttribute("title");
            } else {
                btn.classList.add("nav-btn--soon");
                btn.setAttribute("aria-label", "Number 2 (coming soon)");
                btn.setAttribute("title", "Coming soon");
            }
        }
        dep.updatePageButtonUnlocks();
    }

    return { reconcileNumber2LockState, updateNumber2SidebarUnlockUI };
}
