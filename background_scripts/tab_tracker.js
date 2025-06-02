import { BunnyHole } from "../modules/bunny_hole.mjs";
import { MESSAGE_LOAD, MESSAGE_NEW, MESSAGE_SAVE } from "../modules/constants.mjs";

let currentBunnyHole = undefined;
let activeTabID = undefined;
let loadingTabs = false;

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
    activeTabID = activeTab.id;
    currentBunnyHole.createNode(activeTabID, activeTab.url)
    loadingTabs = false;
    console.log(`Loaded tabs; active tab ID = ${activeTabID}`)
}

function rejectTabLoad(error) {
    console.error(`Error: ${error}`);
    loadingTabs = false;
}

function ioNewBunnyHole() {
    // TODO: Prompt to save if currentBunnyHole is not undefined
    loadingTabs = true;
    currentBunnyHole = new BunnyHole();
    const activeTabPromise = browser.tabs.query({active: true, currentWindow: true});
    activeTabID = activeTabPromise.then(resolveTabLoad, rejectTabLoad);
    console.log(`Created a new bunny hole; current tab is ${activeTabID}`);
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

function handleTabCreated(tab) {
    if(!canProceed()) return;
}

function handleTabActivated(activeInfo) {
    activeTabID = activeInfo.tabId;
    // console.log(activeInfo.tabId + " activated from " + activeInfo.previousTabId);
}

function handleTabsUpdated(tabID, changeInfo, tab) {
    // TODO: Tabs are updated even when they don't navigate us away from the page.
    // For example, clicking a link on a page might just scroll us to a different place on the same page.
    if("url" in changeInfo) console.log("URL changed to " + changeInfo.url);
}

const tabsUpdatedFilter = {
    "properties": ["attention", "status"]
};

function handleTabRemoved(tabID, removeInfo) {
    console.log("Tab " + tabID + " removed");
}

/* ************************ *
 * WEB NAVIGATION LISTENERS *
 ****************************/

function handleWebNavCommit(details) {
    if(!canProceed()) return;
    console.log("BunnyHole: Web Nav Commit to " + details.url);
    currentBunnyHole.createNode(details.tabId, details.url, activeTabID)
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

// WEB NAVIGATION
browser.webNavigation.onCommitted.addListener(handleWebNavCommit);