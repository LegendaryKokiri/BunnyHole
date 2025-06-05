import {BunnyTab} from "./bunny_tab.mjs";

function isUndefined(value) {
    return typeof value === "undefined"
}

class BunnyHole {
    #tab = new BunnyTab(-1, "<Root Node>", "<No URL>");
    #isRoot = true;
    #parent = undefined;
    #children = [];

    createNode(bunnyTab, parentURL = undefined, useRootIfOrphan = false) {
        // If the target URL already exists, don't make a new one.
        // TODO (Post-V0) Add a user option to link to the existing node in a new parent--> child relationship instead of ignoring it
        if(!isUndefined(this.searchByURL(bunnyTab))) {
            console.log("bunny_hole.createNode(): No tab added (URL already exists)");
            this.print();
            return;
        }

        let parentNode = isUndefined(parentURL)
            ? this
            : this.searchByURL(new BunnyTab(-1, "<Search Node>", parentURL));
        if(isUndefined(parentNode)) {
            if(useRootIfOrphan) {
                parentNode = this;
            } else {
                console.error(`BunnyHole.createNode(): Search for ${parentURL} failed`);
                return;
            }
        }

        const newNode = new BunnyHole();
        newNode.#tab = bunnyTab;
        newNode.#isRoot = false;
        newNode.#parent = parentNode;
        parentNode.#children[parentNode.#children.length] = newNode;

        this.print();
    }

    #search(target, nodeEvalFunc) {
        const current = nodeEvalFunc(this);
        if(current === target) return this;

        for (let i = 0; i < this.#children.length; i++) {
            const searchResult = this.#children[i].#search(target, nodeEvalFunc);
            if(!isUndefined(searchResult)) return searchResult;
        }
    }

    searchByTabID(bunnyTab) {
        return this.#search(bunnyTab.id, (node) => node.#tab.id);
    }

    searchByURL(bunnyTab) {
        return this.#search(bunnyTab.url, (node) => node.#tab.url);
    }

    toString() {
        return `[BunnyNode ${this.#tab.toString()} (${this.#children.length})]` 
    }

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