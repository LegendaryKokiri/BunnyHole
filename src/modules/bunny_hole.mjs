import BunnyTab from "./bunny_tab.mjs";
import { buildBHMessage } from "./messages.mjs";
import { StorageKeys } from "./storage.mjs";
import { isUndefined } from "./utils.mjs";

const ROOT_NODE_TITLE = "New Bunny Hole";
const ROOT_NODE_URL   = "<No URL>";
const ROOT_NODE_NOTES = ""

const DEFAULT_JS_OBJ = {
    title:    ROOT_NODE_TITLE,
    url:      ROOT_NODE_URL,
    notes:    ROOT_NODE_NOTES,
    reactKey: 0,
    children: []
}

// TODO: Broadly, this module could use a cleaner definition of when to send browser messages.
class BunnyHole {
    // INTERNAL STATE
    #tab = new BunnyTab(ROOT_NODE_TITLE, ROOT_NODE_URL, ROOT_NODE_NOTES);
    #parent = undefined;
    #children = [];
    
    // REACT INTEGRATION
    static #reactKey = 1;
    #obj = undefined;

    // TODO: Overtly separate the constructor for a new BunnyHole from a loaded BunnyHole.
    // The latter can be a static method.
    constructor(jsObj = undefined) {
        if(isUndefined(jsObj)) {
            BunnyHole.#reactKey = 1;
            this.#obj = this.#createJsObject(ROOT_NODE_TITLE, ROOT_NODE_URL, ROOT_NODE_NOTES);
        } else {
            this.#obj = {...DEFAULT_JS_OBJ, ...jsObj};
        }

        BunnyHole.#reactKey = Math.max(BunnyHole.#reactKey, this.#obj.reactKey + 1);

        this.#tab = new BunnyTab(this.#obj.title, this.#obj.url, this.#obj.notes);

        this.#children = this.#obj.children.map(
            (childObj) => {
                const childNode = new BunnyHole(childObj);
                childNode.#parent = this;
                return childNode;
            }
        );

        this.#obj.children = this.#children.map(
            (child) => {return child.#obj;}
        )
    }

    get jsObject() {
        return this.#obj;
    }

    /**
     * Creates a JavaScript object representing a BunnyHole node.
     * 
     * @param {string}   [title=ROOT_NODE_TITLE]
     * @param {string}   [url=ROOT_NODE_URL]
     * @param {string}   [notes=ROOT_NODE_NOTES]
     * @param {Object[]} [children=[]] 
     * @returns {Object}
     */
    #createJsObject(title = ROOT_NODE_TITLE, url = ROOT_NODE_URL, notes = ROOT_NODE_NOTES, children = []) {
        return {
            ...DEFAULT_JS_OBJ, // For backwards compatibility, we first destructure the default object
            title: title,
            url: url,
            notes: notes,
            reactKey: BunnyHole.#reactKey++,
            children: children
        };
    }

    /**
     * Creates a new node in this BunnyHole.
     * 
     * Creates a new node in this BunnyHole to represent the given BunnyTab.
     * The node is automatically placed in the hierarchy according to the optional
     * parameters, unless a node for `bunnyTab`'s URL already exists, in which case
     * no new node is added.
     * If `parentUrl` is defined, then the node is made a child of the node
     * whose URL matches parentUrl, if such a node exists.
     * Otherwise, the node is made a child of the root node.
     * 
     * @param {BunnyTab} bunnyTab
     * @param {string}   parentUrl
     * @returns {void}
     */
    createNode(bunnyTab, parentUrl = undefined) {
        // If the target URL already exists, don't make a new one.
        if(!isUndefined(this.searchByUrl(bunnyTab.url))) return;

        // Identify parent node
        let parentNode = isUndefined(parentUrl) ? this : this.searchByUrl(parentUrl);
        if(isUndefined(parentNode)) parentNode = this;

        // Insert the node
        parentNode.#addDirectDescendant(bunnyTab);
        this.#reportChange(); // TODO Decide where exactly changes should be reported. Make it consistent and document the choice.
    }

    /**
     * Places a new node in this BunnyHole at the specified location.
     * 
     * Places a new node in this BunnyHole to represent the given BunnyTab.
     * The node is placed at the location specified by `pathToNode`, which
     * is a list of indices that specify a recursive traversal of the
     * Bunny Hole.
     * If `after` is true, the node is placed after the node at the
     * given `pathToNode`.
     * 
     * @param {BunnyTab} bunnyTab 
     * @param {int[]} pathToNode 
     * @param {boolean} after 
     * @returns {void}
     */
    placeNode(bunnyTab, pathToNode, after) {
        // If the target URL already exists, don't make a new one.
        if(!isUndefined(this.searchByUrl(bunnyTab.url))) return;

        // Identify parent node and where to add the new node
        const parentNode = this.#getNode(pathToNode.slice(0, pathToNode.length - 1));
        let addIndex = pathToNode[pathToNode.length - 1];
        addIndex = after ? addIndex + 1 : after;

        // Insert the node
        parentNode.#addDirectDescendant(bunnyTab, [], addIndex);
        this.#reportChange(); // TODO Decide where exactly changes should be reported. Make it consistent and document the choice.
    }

    /**
     * Edits the node in this BunnyHole at the specified location.
     * 
     * @param {int[]} pathToNode 
     * @param {string} title 
     * @param {string} url 
     * @returns {void}
     */
    editNode(pathToNode, title = undefined, url = undefined, notes = undefined) {
        const node = this.#getNode(pathToNode);

        // TODO Is there a broadly cleaner way to keep the jsObject updated? Maybe we could abstract it away to the BunnyTab more effectively?
        if(!isUndefined(title)) {
            node.#tab.title = title;
            node.#obj.title = title;
        }

        if(!isUndefined(url)) {
            node.#tab.url = url;
            node.#obj.url = url;
        }

        if(!isUndefined(notes)) {
            node.#tab.notes = notes;
            node.#obj.notes = notes;
        } 
        
        this.#reportChange();
    }

    /**
     * Deletes the node in this BunnyHole at the specified location.
     * 
     * @param {int[]} pathToNode 
     * @returns {void}
     */
    deleteNode(pathToNode) {
        if(pathToNode.length === 0) return;

        let deleteParent = this;
        let n = pathToNode.length;

        for(let i = 0; i < n - 1; i++) {
            deleteParent = deleteParent.#children[pathToNode[i]];
        }

        deleteParent.#children.splice(pathToNode[n - 1], 1);
        deleteParent.#obj.children.splice(pathToNode[n - 1], 1);

        this.#reportChange();
    }

    /**
     * Repositions a node in this BunnyHole.
     * 
     * Moves a node in this BunnyHole to a different location in the same
     * Bunny Hole. Assumes without checking that the source and destination tabs
     * exist.
     * 
     * If `after` is true, then places the source node after the destination node.
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

        // Enforce that the root level may not be involved in repositioning
        if(srcPath.length === 0) {
            console.error("Cannot move the root node.");
            return;
        }

        if(dstPath.length === 0) {
            console.error("Cannot place a node on the same nesting level as the root node.");
            return;
        }

        // Find parent and source nodes before any arrays are modified
        const srcParent = this.#getNode(srcPath.slice(0, -1));
        const srcNode = srcParent.#getNode(srcPath.slice(-1));
        const dstParent = this.#getNode(dstPath.slice(0, -1));
        const dstNode = dstParent.#getNode(dstPath.slice(-1));

        // Remove source node from parent's children
        const srcIndex = srcPath.at(-1);
        srcParent.#children.splice(srcIndex, 1);
        srcParent.#obj.children.splice(srcIndex, 1);

        // Replace source node among destination's children
        const afterOffset = after ? 1 : 0;
        const dstIndex = dstParent.#children.indexOf(dstNode) + afterOffset;
        dstParent.#children.splice(dstIndex, 0, srcNode);
        dstParent.#obj.children.splice(dstIndex, 0, srcNode.jsObject);

        // Update source node's parent pointer
        srcNode.#parent = dstParent;
        
        // Report change
        this.#reportChange();
    }

    /**
     * Returns the node at the specified path.
     * 
     * @param {int[]} pathToNode 
     * @returns {BunnyHole}
     */
    #getNode(pathToNode) {
        if(pathToNode.length === 0) return this;
        const childNode = this.#children[pathToNode[0]];
        return childNode.#getNode(pathToNode.slice(1))
    }

    #addDirectDescendant(bunnyTab, children=[], addIndex=-1) {
        const newObj = this.#createJsObject(bunnyTab.title, bunnyTab.url, bunnyTab.notes, children);
        const newNode = new BunnyHole(newObj);
        newNode.#tab = bunnyTab;
        newNode.#parent = this;

        const index = addIndex === -1 ? this.#children.length : addIndex;
        this.#children.splice(index, 0, newNode); // TODO: This is reusing code from insertChild(). Refactoring may be good.
        this.#obj.children.splice(index, 0, newNode.jsObject);
    }

    #reportChange() {
        browser.storage.local.set({ [StorageKeys.BUNNY_HOLE]: this.#obj }).then(() => {});
        const message = buildBHMessage(this.#obj);
        browser.runtime.sendMessage(message);
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
     * @returns {BunnyHole}
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
     * Searches for a node whose URL matches that of the given BunnyTab.
     * 
     * @param {BunnyTab} bunnyTab 
     * @returns {BunnyHole}
     */
    searchByUrl(url) {
        return this.#search(url, (node) => node.#tab.url);
    }

    /**
     * Returns a string representation of this BunnyHole.
     * 
     * @returns {string}
     */
    toString() {
        return `[BunnyNode ${this.#tab.toString()} (${this.#children.length})]` 
    }

    /**
     * Prints a representation of this BunnyHole to the console.
     * 
     * @returns {void}
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