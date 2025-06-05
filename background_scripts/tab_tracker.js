import { BunnyHole } from "../modules/bunny_hole.mjs";
import { BunnyTab } from "../modules/bunny_tab.mjs";
import { MESSAGE_LOAD, MESSAGE_NEW, MESSAGE_SAVE } from "../modules/constants.mjs";

// BUNNY HOLE
let currentBunnyHole = undefined;

// TAB TRACKING
const tabMap = new Map(); // Maps tab IDs to BunnyTab objects
let loadingTabs = false; // TODO: After implementing webNav, make sure you actually need this?
let sourceTabID = undefined;

/* ***************** *
 * UTILITY FUNCTIONS *
 *********************/

function canProceed() {
    return currentBunnyHole !== undefined && !loadingTabs;
}

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

function resolveTabLoad(activeTabList) {
    const activeTab = activeTabList[0];
    const bunnyTab = new BunnyTab(activeTab.id, activeTab.title, activeTab.url);
    sourceTabID = activeTab.id;
    currentBunnyHole.createNode(bunnyTab)
    mapTab(activeTab.id);
    loadingTabs = false;
    console.log(`Loaded tabs; active tab ID = ${activeTab.id}`)
}

function rejectTabLoad(error) {
    console.error(`Error: ${error}`);
    loadingTabs = false;
}

function ioNewBunnyHole() {
    // TODO: Prompt to save if currentBunnyHole is not undefined
    loadingTabs = true;
    currentBunnyHole = new BunnyHole();
    browser.tabs.query({active: true, currentWindow: true}).then(resolveTabLoad, rejectTabLoad);
    console.log(`Created a new bunny hole`);
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

function handleInstallation(details) {
    const installMessage = "BunnyHole has been successfully installed!";
    const tempAlert = "\n<Temporary Installation>"
    const displayMessage = details.temporary ? installMessage + tempAlert : installMessage;
    
    createNotification(displayMessage);
}

/* ************* *
 * TAB LISTENERS *
 *****************/

function mapTab(tabID) {
    browser.tabs.get(tabID).then(
        (tab) => {
            const bunnyTab = new BunnyTab(tab.id, tab.title, tab.url);
            tabMap.set(tab.id, bunnyTab);
        },
        (error) => {
            console.error(error);
        }
    );
}

function unmapTab(tabID) {
    tabMap.delete(tabID);
}

function handleTabCreated(tab) {
    if(!canProceed()) return;
}

function handleTabActivated(activeInfo) {
    // console.log(activeInfo.tabId + " activated from " + activeInfo.previousTabId);
    if(!canProceed()) return;
    sourceTabID = activeInfo.tabId;
    if(!tabMap.has(activeInfo.tabId)) mapTab(activeInfo.tabId);
}

function handleTabsUpdated(tabID, changeInfo, tab) {
    // TODO: Tabs are updated even when they don't navigate us away from the page.
    // For example, clicking a link on a page might just scroll us to a different place on the same page.
    if(!canProceed()) return;
    mapTab(tabID);
}

// "status" is included for compatibility with Firefox 87 and earlier
const tabsUpdatedFilter = {
    "properties": ["title", "url", "status"]
};

function handleTabRemoved(tabID, removeInfo) {
    unmapTab(tabID);
}

/* ************************ *
 * WEB NAVIGATION LISTENERS *
 ****************************/

// TODO Can this be merged with the same resolve/reject pair above?
function resolveLoadedDOM(tab) {
    console.log(`Creating node that is child of ${sourceTabID}`);
    const loadedTab = new BunnyTab(tab.id, tab.title, tab.url);
    currentBunnyHole.createNode(loadedTab, tabMap.get(sourceTabID).url); //TODO Really the tab should always be explicitly looked up since the "back" and "forward" buttons exist, but they change the tab without firing an event.
    mapTab(tab.id);
}

function rejectLoadedDOM(error) {
    console.error(error);
}

function handleWebNavCreatedNavigationTarget(details) {
    // TODO details.sourceTabId has the tab from which the navigation was initiated.
    // We can use this to search for that tab's title and ID.
    if(!canProceed()) return;
    console.log(`Created WebNav target to ${details.url} from ${details.sourceTabId}`);
    sourceTabID = details.sourceTabId;
    if(!tabMap.has(sourceTabID)) mapTab(sourceTabID);
}

function handleWebNavDOMContentLoaded(details) {
    if(!canProceed()) return;
    browser.tabs.get(details.tabId).then(resolveLoadedDOM, rejectLoadedDOM);
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
browser.tabs.onUpdated.addListener(handleTabsUpdated, tabsUpdatedFilter);
browser.tabs.onRemoved.addListener(handleTabRemoved);

// WEB NAVIGATION
browser.webNavigation.onCreatedNavigationTarget.addListener(handleWebNavCreatedNavigationTarget);
browser.webNavigation.onDOMContentLoaded.addListener(handleWebNavDOMContentLoaded);