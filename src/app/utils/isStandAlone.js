/**
 * Return Boolean to know if app is runnign in App or not
 */
const isStandAlone = window.matchMedia("(display-mode: standalone)").matches;

export { isStandAlone };
