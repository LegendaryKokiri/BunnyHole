/* ***************** *
 * UTILITY FUNCTIONS *
 *********************/

function createNotification(message) {
    browser.notifications.create("Bunny Hole", {
        type: "basic",
        message: message,
        title: "Bunny Hole",
        iconUrl: "icons/icon-96.png"
    });
}

/* ********************** *
 * INSTALLATION LISTENERS *
 **************************/

function handleInstallation(details) {
    if(details.temporary) console.log("BunnyHole: Temporary Installation");

    const installMessage = "BunnyHole has been successfully installed!";
    const tempAlert = "\n<Temporary Installation>"
    const displayMessage = details.temporary ? installMessage + tempAlert : installMessage;
    
    createNotification(displayMessage);
}

/* ************* *
 * TAB LISTENERS *
 *****************/

function handleTabCreated(tab) {
    createNotification(tab.id + " created");
}

function handleTabActivated(tab) {
    createNotification(tab.id + " activated");
}

function handleTabsUpdated(tabID, changeInfo, tab) {
    // TODO: Tabs are updated even when they don't navigate us away from the page.
    // For example, clicking a link on a page might just scroll us to a different place on the same page.
    createNotification("Tabs updated");
}

const tabsUpdatedFilter = {
    "properties": ["attention", "status"]
};

function handleTabRemoved(tabID, removeInfo) {
    createNotification("Tab " + tabID + " removed");
}

/* ************************ *
 * WEB NAVIGATION LISTENERS *
 ****************************/

function handleWebNavCommit(details) {
    createNotification("BunnyHole: Web Nav Commit to " + details.url);
}

/* ************* *
 * ADD LISTENERS *
 *****************/

// INSTALLATION
browser.runtime.onInstalled.addListener(handleInstallation);

// TAB
browser.tabs.onCreated.addListener(handleTabCreated);
browser.tabs.onActivated.addListener(handleTabActivated);
browser.tabs.onUpdated.addListener(handleTabsUpdated, tabsUpdatedFilter);

// WEB NAVIGATION
browser.webNavigation.onCommitted.addListener(handleWebNavCommit);