import { BunnyHoleIO } from "./io.mjs";
import { WebTracker } from "./web_tracker.mjs";

/* ***************** *
 * UTILITY FUNCTIONS *
 *********************/

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

/* ********* *
 * STARTUP *
 ***********/

// INSTALLATION
browser.runtime.onInstalled.addListener(handleInstallation);

// INITIALIZE MODULES
const io = new BunnyHoleIO();
const webTracker = new WebTracker();
io.addCallback(webTracker.ioCallback);