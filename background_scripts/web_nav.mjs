class WebNav {

    #sourceTabId = undefined; // The id of the tab sourcing new webpages
    #navInNewTab = false; // Was a new tab created for the current web navigation?

    constructor() {
        browser.webNavigation.onCreatedNavigationTarget.addListener(handleWebNavCreatedNavigationTarget);
        browser.webNavigation.onBeforeNavigate.addListener(handleWebNavBeforeNavigate);
        browser.webNavigation.onCompleted.addListener(handleWebNavCompleted);
    }

    /**
     * Handles the webNavigation onCreatedNavigationTarget event.
     * 
     * Updates the tracking variables to indicate that the upcoming web navigation
     * is occurring in that new tab.
     * Also updates the sourceTabId to the tab from which the navigation originates.
     */
    #handleWebNavCreatedNavigationTarget(details) {
        // TODO details.sourceTabId has the tab from which the navigation was initiated.
        // We can use this to search for that tab's title and id.
        if(!canProceed()) return;
        this.#navInNewTab = true;
        this.#sourceTabId = details.sourceTabId;
    }

    /**
     * Handles the webNavigation onBeforeNavigate event.
     * 
     * If `navInNewTab` is true, indicating that the tracking variables were already
     * updated for this navigation, then `navInNewTab` is reset to false.
     * The function returns immediately afterwards.
     * Otherwise, updates the tracking variables to indicate that the upcoming navigation
     * is occurring in the current tab.
     */
    #handleWebNavBeforeNavigate(details) {
        if(!canProceed()) return; 

        if(this.#navInNewTab) {
            this.#navInNewTab = false;
            return;
        }

        this.#sourceTabId = details.tabId;
    }

    /**
     * Handles the webNavigation onCompleted event.
     * 
     * Creates a node for the loaded webpage in the current BunnyHole.
     * Then creates a mapping for that new webpage in the tabMap.
     */
    #handleWebNavCompleted(details) {
        if(!canProceed()) return;
        browser.tabs.get(details.tabId).then(
            (tab) => {
                const loadedTab = new BunnyTab(tab.id, tab.title, tab.url);
                currentBunnyHole.createNode(loadedTab, tabMap.get(sourceTabId).url, true); //TODO Really the tab should always be explicitly looked up since the "back" and "forward" buttons exist, but they change the tab without firing an event.
                mapTab(tab.id);
            },
            (error) => {
                console.error(error);
            }
        );
    }

}

export { WebNav }