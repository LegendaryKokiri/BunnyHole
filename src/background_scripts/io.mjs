import BunnyTab from "../modules/bunny_tab.mjs";
import BunnyHole from "../modules/bunny_hole.mjs";
import { buildBHMessage, IOCommands, MessageTypes, UICommands } from "../modules/messages.mjs";
import { StorageKeys } from "../modules/storage.mjs";
import { isUndefined } from "../modules/utils.mjs";

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
     * @param {*} _sender 
     * @param {*} _sendResponse 
     */
    #handleMessage(message, _sender, _sendResponse) {
        switch(message.type) {
            case MessageTypes.IO:
                this.#handleIOMessage(message);
                break;
            case MessageTypes.UI:
                this.#handleUIMessage(message);
                break;
            default:
                break;
        }
    }

    #handleIOMessage(message) {
        switch(message.command) {
            case IOCommands.NEW:
                this.#newBunnyHole();
                break;
            case IOCommands.LOAD:
                this.#loadBunnyHole();
                break;
            case IOCommands.OPEN:
                this.#openBunnyHole(message.content.file);
                break;
            case IOCommands.SAVE:
                this.#saveBunnyHole();
                break;
            case IOCommands.CLOSE:
                this.#closeBunnyHole();
                break;
            default:
                break;
        }
    }

    #handleUIMessage(message) {
        switch(message.command) {
            case UICommands.ADD_BH_NODE:
                // Handled in the WebTracker, where tab data is more easily accessible.
                break;
            case UICommands.EDIT_BH_NODE:
                this.#currentBunnyHole.editNode(
                    message.content.path,
                    message.content.title,
                    message.content.url,
                    undefined
                );
                break;
            case UICommands.EDIT_BH_NOTES:
                this.#currentBunnyHole.editNode(
                    message.content.path,
                    undefined,
                    undefined,
                    message.content.notes
                );
                break;
            case UICommands.DELETE_BH_NODE:
                this.#currentBunnyHole.deleteNode(
                    message.content.path
                );
                break;
            case UICommands.SWAP_BH_NODES:
                this.#currentBunnyHole.repositionNode(
                    message.content.srcPath,
                    message.content.dstPath,
                    true
                );
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
                const bunnyTab = new BunnyTab(tab.title, tab.url, "");
                this.#currentBunnyHole = new BunnyHole();
                this.#currentBunnyHole.createNode(bunnyTab); // TODO: In this case, we don't have to make a BunnyHole message and send it because creating the node does it for us. For load and open, we do have to. We should pick one and only one module to be in charge of this. (Probably bunny_hole.mjs)
                this.#runCallbacks();
            }, 
            (error) => {
                console.error(error);
            }
        );
    }
    
    #loadBunnyHole() {
        // TODO: Prompt to save if this.#currentBunnyHole is not undefined
        const key = StorageKeys.BUNNY_HOLE;
        browser.storage.local.get(key).then(
            (results) => {
                this.#currentBunnyHole = new BunnyHole(results[key]);
                this.#runCallbacks();
                const message = buildBHMessage(this.#currentBunnyHole.jsObject);
                browser.runtime.sendMessage(message);
            } 
        );
    }

    #openBunnyHole(file) {
        // TODO: Prompt to save if this.#currentBunnyHole is not undefined
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            const contentString = reader.result;
            const content = JSON.parse(contentString);
            this.#currentBunnyHole = new BunnyHole(content);
            this.#runCallbacks();
            const message = buildBHMessage(this.#currentBunnyHole.jsObject);
            browser.runtime.sendMessage(message);
        });

        reader.readAsText(file);
    }
    
    #saveBunnyHole() {
        // TODO: We'll probably have to make a popup
        if(isUndefined(this.#currentBunnyHole)) return;
        const bunnyHole = JSON.stringify(this.#currentBunnyHole.jsObject);
        const blob = new Blob([bunnyHole], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        browser.downloads.download({ url: url, saveAs: true }).then(
            () => {},
            () => {}
        );
    }
    
    #closeBunnyHole() {
        // TODO: Prompt to save if this.#currentBunnyHole is not undefined
        this.#currentBunnyHole = undefined;
    }
}

export default BunnyHoleIO;