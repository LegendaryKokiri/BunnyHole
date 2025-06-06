class TabTracker {
    #tabMap = undefined; // Maps tab ids to BunnyTab objects

    constructor() {
        this.#tabMap = new Map();

        browser.tabs.onCreated.addListener(this.#handleTabCreated);
        browser.tabs.onActivated.addListener(this.#handleTabActivated);
        browser.tabs.onUpdated.addListener(this.#handleTabUpdated, this.#tabsUpdatedFilter);
        browser.tabs.onRemoved.addListener(this.#handleTabRemoved);
    }

    /**
     * Maps the given tabId in the tabMap.
     * 
     * Creates a mapping in this TabTracker from the given tabId to a BunnyTab
     * containing metadata about that id.
     */
    mapTab(tabId) {
        browser.tabs.get(tabId).then(
            (tab) => {
                const bunnyTab = new BunnyTab(tab.id, tab.title, tab.url);
                this.#tabMap.set(tab.id, bunnyTab);
            },
            (error) => {
                console.error(error);
            }
        );
    }

    /**
     * Unmaps the given tabId from this TabTracker
     */
    unmapTab(tabId) {
        this.#tabMap.delete(tabId);
    }

    /**
     * Handles the onTabCreated event.
     * 
     * Maps the created tab's id to a BunnyTab containing that tab's metadata.
     */
    #handleTabCreated(tab) {
        if(!canProceed()) return;
        console.log("handleTabCreated(): Mapping due to tab created");
        mapTab(tab.id);
    }

    /**
     * Handles the onTabActivated event.
     * 
     * Updates the tab tracking variables to indicate that a new tab is active.
     * If the activated tab is not mapped, maps that tab's id in the tabMap.
     */
    #handleTabActivated(activeInfo) {
        // console.log(activeInfo.tabId + " activated from " + activeInfo.previousTabId);
        if(!canProceed()) return;
        console.log("handleTabActivated(): Tab activated");
        if(!tabMap.has(activeInfo.tabId)) {
            console.log("handleTabActivated(): Mapping due to tab activated");
            mapTab(activeInfo.tabId);
        }
    }

    /**
     * Handles the onTabUpdated event.
     * 
     * Currently does nothing.
     */
    #handleTabUpdated(tabId, changeInfo, tab) {
        // TODO: Tabs are updated even when they don't navigate us away from the page.
        // For example, clicking a link on a page might just scroll us to a different place on the same page.
        if(!canProceed()) return;
        // console.log("handleTabUpdated(): Mapping due to tab updated");
        // mapTab(tabId);
        // TODO: We stopped mapping tab here it conflicting with web nav events.
        // However, can this code handle redirection? We may have to make a lab environment to find out.
    }

    // "status" is included for compatibility with Firefox 87 and earlier
    #tabsUpdatedFilter = {
        "properties": ["title", "url", "status"]
    };

    /**
     * Handles the onTabRemoved event.
     * 
     * Unmaps the removed tab's id from the tabMap.
     */
    #handleTabRemoved(tabId, removeInfo) {
        unmapTab(tabId);
    }
}

export {TabTracker}