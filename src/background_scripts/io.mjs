import BunnyTab from "../modules/bunny_tab.mjs";
import BunnyHole from "../modules/bunny_hole.mjs";
import { MESSAGE_NEW, MESSAGE_LOAD, MESSAGE_SAVE, MESSAGE_CLOSE, MESSAGE_IO_COMPLETE } from "../modules/constants.mjs";

class BunnyHoleIO {
    #currentBunnyHole = undefined;
    #messageHandler = undefined;

    #ioCallbacks = undefined;

    constructor() {
        this.#messageHandler = this.#handleMessage.bind(this);
        this.#ioCallbacks = []

        browser.runtime.onMessage.addListener(this.#messageHandler);
    }

    get bunnyHole() {
        return this.#currentBunnyHole;
    }

    /**
     * Adds a callback to this BunnyHoleIO.
     * 
     * Add a callback to this BunnyHoleIO. The callback function is assumed
     * to take exactly one argument that is either a BunnyHole or undefined
     * This callback will be called every time this the BunnyHOleIO updates
     * `this.#currentBunnyHole`.
     * 
     * @param {Function} callback 
     */
    addCallback(callback) {
        this.#ioCallbacks.push(callback);
    }

    /**
     * Runs all callbacks.
     */
    #runCallbacks() {
        for(let i = 0; i < this.#ioCallbacks.length; i++) {
            this.#ioCallbacks[i](this.#currentBunnyHole);
        }
    }

    /**
     * Responds to a message event.
     * 
     * @param {number} message 
     * @param {*} sender 
     * @param {*} sendResponse 
     */
    #handleMessage(message, sender, sendResponse) {
        switch(message) {
            case MESSAGE_NEW:
                this.#newBunnyHole();
                break;
            case MESSAGE_LOAD:
                this.#loadBunnyHole();
                break;
            case MESSAGE_SAVE:
                this.#saveBunnyHole();
                break;
            case MESSAGE_CLOSE:
                this.#closeBunnyHole();
                break;
            default:
                break;
        }
    }

    /**
     * Creates a new Bunny Hole.
     * 
     * This function points `#currentBunnyHole` at new BunnyHole object.
     * A new node for the active tab is created in this object.
     * Tab tracking variables are also set according to the active tab.
     */
    #newBunnyHole() {
        // TODO: Prompt to save if #currentBunnyHole is not undefined
        browser.tabs.query({active: true, currentWindow: true}).then(
            (activeTabList) => {
                const tab = activeTabList[0];
                const bunnyTab = new BunnyTab(tab.id, tab.title, tab.url);
                this.#currentBunnyHole = new BunnyHole();
                this.#currentBunnyHole.createNode(bunnyTab);
                this.#runCallbacks();
            }, 
            (error) => {
                console.error(error);
            }
        );
    }
    
    #loadBunnyHole() {
        // TODO: Prompt to save if this.#currentBunnyHole is not undefined
    }
    
    #saveBunnyHole() {
        // TODO: We'll probably have to make a popup
    }
    
    #closeBunnyHole() {
        // TODO: Prompt to save if this.#currentBunnyHole is not undefined
        this.#currentBunnyHole = undefined;
    }
}

export default BunnyHoleIO;