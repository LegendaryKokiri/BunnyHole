import BunnyTab from "../modules/bunny_tab.mjs";
import BunnyHole from "../modules/bunny_hole.mjs";
import { isUndefined } from "../modules/utils.mjs";

class WebTracker {

    #bunnyHole = undefined;
    #tabMap = undefined;
    #sourceUrl = undefined; // The id of the tab sourcing new webpages
    #navInNewTab = false; // Was a new tab created for the current web navigation?

    #tabCreatedHandler = undefined;
    #tabActivatedHandler = undefined;
    #tabRemovedHandler = undefined;

    #createdHandler = undefined;
    #beforeHandler = undefined;
    #completedHandler = undefined;

    constructor() {
        this.#tabMap = new Map();

        this.#tabCreatedHandler = this.#handleTabCreated.bind(this);
        this.#tabActivatedHandler = this.#handleTabActivated.bind(this);
        this.#tabRemovedHandler = this.#handleTabRemoved.bind(this);

        this.#createdHandler = this.#handleWebNavCreatedNavigationTarget.bind(this);
        this.#beforeHandler = this.#handleWebNavBeforeNavigate.bind(this);
        this.#completedHandler = this.#handleWebNavCompleted.bind(this);
    }

    /**
     * Getter for this WebTracker's IO callback.
     */
    get ioCallback() {
        return this.#ioCallback.bind(this);
    }

    /**
     * Updates this WebTracker in response to an IO event.
     * 
     * If the BunnyHOle is undefined, disables all listeners for this WebTracker.
     * Otherwise, reads the contents of all tabs to initialize the tabMap,
     * then enables all listeners for this WebTracker.
     * 
     * @param {BunnyHole} bunnyHole 
     */
    #ioCallback(bunnyHole) {
        this.#bunnyHole = bunnyHole;
        if(isUndefined(this.#bunnyHole)) {
            this.#disableListeners();
            return;
        }

        browser.tabs.query({}).then(
            (allTabs) => {
                for(const tab of allTabs) {
                    this.#mapTabByInfo(tab);
                }

                this.#enableListeners();
            },
            (error) => {
                console.error(error);
            }
        );
    }

    /**
     * Enables all of this WebTracker's event listeners.
     */
    #enableListeners() {
        browser.tabs.onCreated.addListener(this.#tabCreatedHandler);
        browser.tabs.onActivated.addListener(this.#tabActivatedHandler);
        browser.tabs.onRemoved.addListener(this.#tabRemovedHandler);

        browser.webNavigation.onCreatedNavigationTarget.addListener(this.#createdHandler);
        browser.webNavigation.onBeforeNavigate.addListener(this.#beforeHandler);
        browser.webNavigation.onCompleted.addListener(this.#completedHandler);
    }

    /**
     * Disables all of this WebTracker's event listeners.
     */
    #disableListeners() {
        browser.tabs.onCreated.removeListener(this.#tabCreatedHandler);
        browser.tabs.onActivated.removeListener(this.#tabActivatedHandler);
        browser.tabs.onRemoved.removeListener(this.#tabRemovedHandler);

        browser.webNavigation.onCreatedNavigationTarget.removeListener(this.#createdHandler);
        browser.webNavigation.onBeforeNavigate.removeListener(this.#beforeHandler);
        browser.webNavigation.onCompleted.removeListener(this.#completedHandler);
    }

    /**
     * @param {BunnyHole} hole
     */
    set bunnyHole(hole) {
        this.#bunnyHole = hole;
    }

    /**
     * Maps the given tabId in the tabMap.
     * 
     * Creates a mapping in this TabTracker from the given tabId to a BunnyTab
     * containing metadata about that id.
     * @param {number} tabId The ID of the tab to map.
     */
    #mapTabByLookup(tabId) {
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
     * Maps the given tab in the tabMap.
     * 
     * Creates a mapping in this TabTracker from the given tab data's id
     * to a BunnyTab containing metadata about that id.
     * @param {tabs.Tab} tab 
     */
    #mapTabByInfo(tab) {
        const bunnyTab = new BunnyTab(tab.id, tab.title, tab.url);
        this.#tabMap.set(tab.id, bunnyTab);
    }

    /**
     * Unmaps the given tabId from this TabTracker
     * @param {number} tabId 
     */
    #unmapTab(tabId) {
        this.#tabMap.delete(tabId);
    }

    /**
     * Handles the onTabCreated event.
     * 
     * Maps the created tab's id to a BunnyTab containing that tab's metadata.
     */
    #handleTabCreated(tab) {
        this.#mapTabByInfo(tab);
    }

    /**
     * Handles the onTabActivated event.
     * 
     * Updates the tab tracking variables to indicate that a new tab is active.
     * If the activated tab is not mapped, maps that tab's id in the tabMap.
     */
    #handleTabActivated(activeInfo) {
        if(!this.#tabMap.has(activeInfo.tabId)) {
            this.#mapTabByLookup(activeInfo.tabId);
        }
    }

    /**
     * Handles the onTabRemoved event.
     * 
     * Unmaps the removed tab's id from the tabMap.
     */
    #handleTabRemoved(tabId, removeInfo) {
        this.#unmapTab(tabId);
    }

    /**
     * Handles the webNavigation onCreatedNavigationTarget event.
     * 
     * Updates the tracking variables to indicate that the upcoming web navigation
     * is occurring in that new tab.
     * Also updates the sourceTabId to the tab from which the navigation originates.
     */
    #handleWebNavCreatedNavigationTarget(details) {
        this.#navInNewTab = true;
        const sourceTab = this.#tabMap.get(details.sourceTabId);
        if(isUndefined(sourceTab)) return; // Link was clicked from sidebar UI
        this.#sourceUrl = sourceTab.url;
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
        if(this.#navInNewTab) {
            this.#navInNewTab = false;
            return;
        }

        this.#sourceUrl = this.#tabMap.get(details.tabId).url;
    }

    /**
     * Handles the webNavigation onCompleted event.
     * 
     * Creates a node for the loaded webpage in the current BunnyHole.
     * Then creates a mapping for that new webpage in the tabMap.
     */
    #handleWebNavCompleted(details) {
        browser.tabs.get(details.tabId).then(
            (tab) => {
                const loadedTab = new BunnyTab(tab.id, tab.title, tab.url);
                this.#bunnyHole.createNode(loadedTab, this.#sourceUrl, true);
                this.#mapTabByInfo(tab);
            },
            (error) => {
                console.error(error);
            }
        );
    }

}

export default WebTracker;