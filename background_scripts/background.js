import { BunnyHole } from "../modules/bunny_hole.mjs";
import { BunnyTab } from "../modules/bunny_tab.mjs";
import { MESSAGE_LOAD, MESSAGE_NEW, MESSAGE_SAVE } from "../modules/constants.mjs";

// BUNNY HOLE
let currentBunnyHole = undefined;

// TAB TRACKING
const tabMap = new Map(); // Maps tab ids to BunnyTab objects
let sourceTabId = undefined; // The id of the tab sourcing new webpages
let navInNewTab = false; // Was a new tab created for the current web navigation?

/* ***************** *
 * UTILITY FUNCTIONS *
 *********************/

/**
 * Returns whether or not tab tracking/web navigation events should be handled.
 * @returns {boolean}
 */
function canProceed() {
    return currentBunnyHole !== undefined;
}

/**
 * Creates a Bunny Hole notification with the given message.
 * @param {string} message 
 */
function createNotification(message) {
    browser.notifications.create("Bunny Hole", {
        type: "basic",
        message: message,
        title: "Bunny Hole",
        iconUrl: "icons/icon-96.png"
    });
}

/* ***************** *
 * MESSAGE LISTENERS *
 *********************/

/**
 * Creates a new Bunny Hole.
 * 
 * This function points `currentBunnyHole` at new BunnyHole object.
 * A new node for the active tab is created in this object.
 * Tab tracking variables are also set according to the active tab.
 */
function ioNewBunnyHole() {
    // TODO: Prompt to save if currentBunnyHole is not undefined
    browser.tabs.query({active: true, currentWindow: true}).then(
        (activeTabList) => {
            const tab = activeTabList[0];
            const bunnyTab = new BunnyTab(tab.id, tab.title, tab.url);
            mapTab(tab.id);
            currentBunnyHole = new BunnyHole();
            currentBunnyHole.createNode(bunnyTab)
        }, 
        (error) => {
            console.error(`Error: ${error}`);
        }
    );
}

function ioLoadBunnyHole() {
    // TODO: Prompt to save if currentBunnyHole is not undefined
}

function ioSaveBunnyHole() {

}

function ioCloseBunnyHole() {
    // TODO: Prompt to save if currentBunnyHole is not undefined
    currentBunnyHole = undefined;
}

/**
 * Responds to a message event.
 * 
 * @param {number} message 
 * @param {*} sender 
 * @param {*} sendResponse 
 */
function handleMessage(message, sender, sendResponse) {
    switch(message) {
        case MESSAGE_NEW:
            ioNewBunnyHole();
            break;
        case MESSAGE_LOAD:
            ioLoadBunnyHole();
            break;
        case MESSAGE_SAVE:
            ioSaveBunnyHole();
            break;
        default:
            break;
    }
}

/* ********************** *
 * INSTALLATION LISTENERS *
 **************************/

/**
 * Notifies the user when BunnyHole is installed.
 * 
 * @param {Object} details Details regarding the installation.
 */
function handleInstallation(details) {
    const installMessage = "BunnyHole has been successfully installed!";
    const tempAlert = "\n<Temporary Installation>"
    const displayMessage = details.temporary ? installMessage + tempAlert : installMessage;
    
    createNotification(displayMessage);
}

/* ************* *
 * TAB LISTENERS *
 *****************/

/**
 * Maps the given tabId in the tabMap.
 * 
 * Creates a mapping in the tabMap from the given tabId to a BunnyTab
 * containing metadata about that id.
 */
function mapTab(tabId) {
    browser.tabs.get(tabId).then(
        (tab) => {
            const bunnyTab = new BunnyTab(tab.id, tab.title, tab.url);
            console.log(`mapTab(): Mapped ${tab.id} --> ${tab.url}`);
            tabMap.set(tab.id, bunnyTab);
        },
        (error) => {
            console.error(error);
        }
    );
}

/**
 * Unmaps the given tabId from the tabMap. 
 */
function unmapTab(tabId) {
    tabMap.delete(tabId);
}

/**
 * Handles the onTabCreated event.
 * 
 * Maps the created tab's id to a BunnyTab containing that tab's metadata.
 */
function handleTabCreated(tab) {
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
function handleTabActivated(activeInfo) {
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
function handleTabUpdated(tabId, changeInfo, tab) {
    // TODO: Tabs are updated even when they don't navigate us away from the page.
    // For example, clicking a link on a page might just scroll us to a different place on the same page.
    if(!canProceed()) return;
    // console.log("handleTabUpdated(): Mapping due to tab updated");
    // mapTab(tabId);
    // TODO: We stopped mapping tab here it conflicting with web nav events.
    // However, can this code handle redirection? We may have to make a lab environment to find out.
}

// "status" is included for compatibility with Firefox 87 and earlier
const tabsUpdatedFilter = {
    "properties": ["title", "url", "status"]
};

/**
 * Handles the onTabRemoved event.
 * 
 * Unmaps the removed tab's id from the tabMap.
 */
function handleTabRemoved(tabId, removeInfo) {
    unmapTab(tabId);
}

/* ************************ *
 * WEB NAVIGATION LISTENERS *
 ****************************/

/**
 * Handles the webNavigation onCreatedNavigationTarget event.
 * 
 * Updates the tracking variables to indicate that the upcoming web navigation
 * is occurring in that new tab.
 * Also updates the sourceTabId to the tab from which the navigation originates.
 */
function handleWebNavCreatedNavigationTarget(details) {
    // TODO details.sourceTabId has the tab from which the navigation was initiated.
    // We can use this to search for that tab's title and id.
    if(!canProceed()) return;
    navInNewTab = true;
    sourceTabId = details.sourceTabId;
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
function handleWebNavBeforeNavigate(details) {
    if(!canProceed()) return; 

    if(navInNewTab) {
        navInNewTab = false;
        return;
    }

    sourceTabId = details.tabId;
}

/**
 * Handles the webNavigation onCompleted event.
 * 
 * Creates a node for the loaded webpage in the current BunnyHole.
 * Then creates a mapping for that new webpage in the tabMap.
 */
function handleWebNavCompleted(details) {
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

/* ************* *
 * ADD LISTENERS *
 *****************/

// MESSAGE
browser.runtime.onMessage.addListener(handleMessage);

// INSTALLATION
browser.runtime.onInstalled.addListener(handleInstallation);

// TAB
browser.tabs.onCreated.addListener(handleTabCreated);
browser.tabs.onActivated.addListener(handleTabActivated);
browser.tabs.onUpdated.addListener(handleTabUpdated, tabsUpdatedFilter);
browser.tabs.onRemoved.addListener(handleTabRemoved);

// WEB NAVIGATION
browser.webNavigation.onCreatedNavigationTarget.addListener(handleWebNavCreatedNavigationTarget);
browser.webNavigation.onBeforeNavigate.addListener(handleWebNavBeforeNavigate);
browser.webNavigation.onCompleted.addListener(handleWebNavCompleted);