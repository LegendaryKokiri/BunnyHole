import BunnyTab from "./bunny_tab.mjs";
import { buildBHMessage } from "./messages.mjs";
import { isUndefined } from "./utils.mjs";

const ROOT_NODE_ID  = -1;
const ROOT_NODE_TITLE = "<Root Node>";
const ROOT_NODE_URL = "<No URL>";

const JS_OBJ_ALL_KEYS = ["title", "url", "reactKey", "children"];

// TODO: Broadly, this module could use a cleaner definition of when to send browser messages.
class BunnyHole {
    // INTERNAL STATE
    #tab = new BunnyTab(ROOT_NODE_ID, ROOT_NODE_TITLE, ROOT_NODE_URL);
    #parent = undefined;
    #children = [];
    
    // REACT INTEGRATION
    static #reactKey = 1;
    #jsObject = undefined;

    constructor(title = ROOT_NODE_TITLE, url = ROOT_NODE_URL) {
        this.#jsObject = this.createJsObject(title, url);
    }

    get jsObject() {
        return this.#jsObject;
    }

    /**
     * Creates a JavaScript object representing a BunnyHole node.
     * 
     * @param {string}   [title=ROOT_NODE_TITLE]
     * @param {string}   [url=ROOT_NODE_URL]
     * @param {Object[]} [children=[]] 
     */
    createJsObject(title = ROOT_NODE_TITLE, url = ROOT_NODE_URL, children = []) {
        return {
            title: title,
            url: url,
            reactKey: BunnyHole.#reactKey++,
            children: children
        };
    }

    /**
     * Verifies that the given object represents a BunnyHole.
     * 
     * @param {Object} jsObject 
     * @returns {boolean} true if the object is a BunnyHole, false otherwise
     */
    static validateJsObject(jsObject) {
        if(typeof jsObject !== "object") return false;

        for(const key of JS_OBJ_ALL_KEYS) {
            if(!Object.hasOwn(jsObject, key)) return false;
        }

        for(const child of jsObject.children) {
            if(!this.validateJsObject(child)) return false;
        }

        return true;
    }

    /**
     * Creates a new node in this BunnyHole.
     * 
     * Creates a new node in this BunnyHole to represent the given BunnyTab.
     * The node is automatically placed in the hierarchy according to the optional
     * parameters, unless a node for `bunnyTab`'s URL already exists, in which case
     * no new node is added.
     * If parentUrl is defined, then the node is made a child of the node
     * whose URL matches parentUrl, if such a node exists.
     * If no such node exists, then the value of `useRootIfOrphan` determines the
     * function's behavior.
     * If `useRootIfOrphan` is true, then the node will be made a child of the root.
     * Otherwise, the node will not be added.
     * 
     * @param {BunnyTab} bunnyTab
     * @param {string}   parentUrl
     * @param {boolean}  useRootIfOrphan
     */
    createNode(bunnyTab, parentUrl = undefined, useRootIfOrphan = false) {
        // If the target URL already exists, don't make a new one.
        console.log(`Placing ${bunnyTab.toString()} under ${parentUrl}`);
        if(!isUndefined(this.searchByUrl(bunnyTab))) return;

        let parentNode = isUndefined(parentUrl)
            ? this
            : this.searchByUrl(new BunnyTab(-1, "<Search Node>", parentUrl));
        if(isUndefined(parentNode)) {
            if(!useRootIfOrphan) {
                console.error(`BunnyHole.createNode(): Search for ${parentUrl} failed`);
                return;
            }

            parentNode = this;
        }

        const parentParent = isUndefined(parentNode.#parent) ? "undefined" : parentNode.#parent.toString();
        console.log(`Parent Node: ${parentNode.#tab.toString()}, child of ${parentParent}`);

        parentNode.#addDirectDescendant(bunnyTab);
        this.reportChange();
    }

    getNode(pathToNode) {
        if(pathToNode.length === 0) return this;
        const childNode = this.#children[pathToNode[0]];
        return childNode.getNode(pathToNode.slice(1))
    }

    placeNode(bunnyTab, pathToNode, after) {
        const parentNode = this.getNode(pathToNode.slice(0, pathToNode.length - 1));
        let addIndex = pathToNode[pathToNode.length - 1];
        addIndex = after ? addIndex + 1 : after;
        parentNode.#addDirectDescendant(bunnyTab, addIndex);
        this.reportChange();
    }

    #addDirectDescendant(bunnyTab, addIndex=-1) {
        const newNode = new BunnyHole(bunnyTab.title, bunnyTab.url);
        newNode.#tab = bunnyTab;
        newNode.#parent = this;

        const index = addIndex === -1 ? this.#children.length : addIndex;
        this.#children.splice(index, 0, newNode); // TODO: This is reusing code from insertChild(). Refactoring may be good.
        this.#jsObject.children.splice(index, 0, newNode.jsObject);
    }

    editNode(pathToNode, title, url) {
        const node = this.getNode(pathToNode);
        node.#tab.values = { title: title, url: url };
        node.#jsObject.title = title;
        node.#jsObject.url = url;
        this.reportChange();
    }

    deleteNode(pathToNode) {
        if(pathToNode.length === 0) return;

        let deleteParent = this;
        let n = pathToNode.length;

        for(let i = 0; i < n - 1; i++) {
            deleteParent = deleteParent.#children[pathToNode[i]];
        }

        deleteParent.#children.splice(pathToNode[n - 1], 1);
        deleteParent.#jsObject.children.splice(pathToNode[n - 1], 1);

        // Report change
        this.reportChange();
    }

    /**
     * Repositions a node in this BunnyHole.
     * 
     * Moves a node in this BunnyHole to a different location in the same
     * Bunny Hole. Assumes without checking that the source and destination tabs
     * exist.
     * 
     * If after is true, then places the source node after the destination node.
     * Otherwise, places the source node before the destination node.
     * 
     * @param {BunnyHole} srcNode
     * @param {BunnyHole} dstNode
     * @param {boolean}  after 
     * @returns 
     */
    repositionNode(srcPath, dstPath, after) {
        // Verify that the destination path is not a child of the source path
        if(dstPath.length >= srcPath.length) {
            let dstIsDescendant = true;
            for(let i = 0; i < srcPath.length; i++) {
                if(srcPath[i] != dstPath[i]) {
                    dstIsDescendant = false;
                    break;
                }
            }

            if(dstIsDescendant) {
                console.error("Cannot move a node into one of its own descendants.")
                return;
            }
        }

        // Find the source node
        const srcNode = this.getNode(srcPath);
        if(isUndefined(srcNode.#parent)) {
            console.error("Cannot move the root node.");
            return;
        }
        
        // Find the destination node
        const dstNode = this.getNode(dstPath);
        if(isUndefined(dstNode.#parent)) {
            console.error("Cannot place a node on the same nesting level as the root node.");
            return;
        }

        // Remove source tab from parent's children
        srcNode.#parent.removeChild(srcNode);

        // Replace source tab among destination's children
        dstNode.#parent.insertChild(srcNode, dstNode, after)

        // Report change
    }

    // TODO: The only reason that removeChild() wasn't made private was to ease implementation. Could we rectify this?
    removeChild(sourceNode) {
        const sourceIndex = this.#children.indexOf(sourceNode);
        this.#children.splice(sourceIndex, 1);
        this.#jsObject.children.splice(sourceIndex, 1);
    }

    reportChange() {
        browser.storage.local.set({ bunnyHole: this.#jsObject }).then(
            () => console.log("Saved Bunny Hole!")
        );
        const message = buildBHMessage(this.#jsObject);
        browser.runtime.sendMessage(message);
    }

    // TODO: The only reason that insertChild() wasn't made private was to ease implementation. Could we rectify this?
    insertChild(sourceNode, destNode, after) {
        const destIndex = this.#children.indexOf(destNode);
        const addIndex = after ? destIndex + 1 : destIndex;
        sourceNode.#parent = this; // TODO: Properly update the parent
        this.#children.splice(addIndex, 0, sourceNode);
        this.#jsObject.children.splice(addIndex, 0, sourceNode.jsObject);
    }

    /**
     * Searches for a node that matches the given criterion.
     * 
     * Searches for a node that, when passed into `nodeEvalFunc`, returns a value
     * equal to `target`, and returns that node.
     * Returns undefined if no such node exists.
     * 
     * @param {Object} target 
     * @param {function} nodeEvalFunc 
     */
    #search(target, nodeEvalFunc) {
        const current = nodeEvalFunc(this);
        if(current === target) return this;

        for (let i = 0; i < this.#children.length; i++) {
            const searchResult = this.#children[i].#search(target, nodeEvalFunc);
            if(!isUndefined(searchResult)) return searchResult;
        }
    }

    /**
     * Searches for a node whose id matches that of the given BunnyTab.
     * 
     * @param {BunnyTab} bunnyTab 
     */
    searchByTabId(bunnyTab) {
        return this.#search(bunnyTab.id, (node) => node.#tab.id);
    }

    /**
     * Searches for a node whose URL matches that of the given BunnyTab.
     * 
     * @param {BunnyTab} bunnyTab 
     */
    searchByUrl(bunnyTab) {
        return this.#search(bunnyTab.url, (node) => node.#tab.url);
    }

    /**
     * Returns a string representation of this BunnyHole.
     */
    toString() {
        return `[BunnyNode ${this.#tab.toString()} (${this.#children.length})]` 
    }

    /**
     * Prints a representation of this BunnyHole to the console.
     */
    print(depth=0) {
        console.log(`|- ${"  ".repeat(depth)}${this.toString()}`)
        for (let i = 0; i < this.#children.length; i++) {
            this.#children[i].print(depth+1)
        }
    }
}

/* ************* *
 * MODULE EXPORT *
 *****************/

export default BunnyHole;
export { ROOT_NODE_TITLE, ROOT_NODE_URL };