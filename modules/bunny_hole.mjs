import {BunnyTab} from "./bunny_tab.mjs";
import { isUndefined } from "./utils.mjs";

class BunnyHole {
    #tab = new BunnyTab(-1, "<Root Node>", "<No URL>");
    #parent = undefined;
    #children = [];

    /**
     * Creates a new node in this BunnyHole.
     * 
     * Creates a new node in this BunnyHole to represent the given BunnyTab.
     * The node is automatically placed in the hierarchy according to the optional
     * parameters, unless a node for `bunnyTab`'s URL already exists, in which case
     * no new node is added.
     * If parentUrl is not undefined, then the node is made a child of the node
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
        // TODO (Post-V0) Add a user option to link to the existing node in a new parent--> child relationship instead of ignoring it
        if(!isUndefined(this.searchByUrl(bunnyTab))) return;

        let parentNode = isUndefined(parentUrl)
            ? this
            : this.searchByUrl(new BunnyTab(-1, "<Search Node>", parentUrl));
        if(isUndefined(parentNode)) {
            if(useRootIfOrphan) {
                parentNode = this;
            } else {
                console.error(`BunnyHole.createNode(): Search for ${parentUrl} failed`);
                return;
            }
        }

        const newNode = new BunnyHole();
        newNode.#tab = bunnyTab;
        newNode.#parent = parentNode;
        parentNode.#children[parentNode.#children.length] = newNode;
        this.print();
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

export {BunnyHole}