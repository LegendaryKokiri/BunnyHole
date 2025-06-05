import {BunnyTab} from "./bunny_tab.mjs";

// TODO: Scoping! None of these fields should be able to be set outside of the class.
const ROOT_ID = "ROOT_NODE";

function isUndefined(value) {
    return typeof value === "undefined"
}

class BunnyHole {
    #tab = new BunnyTab(-1, "<Root Node>", "<No URL>");
    #isRoot = true;
    #parent = undefined;
    #children = [];

    createNode(bunnyTab, parentURL = undefined) {
        const parentNode = isUndefined(parentURL)
            ? this
            : this.searchByURL(new BunnyTab(-1, "<Search Node>", parentURL));
        if(isUndefined(parentNode)) {
            console.error(`BunnyHole.createNode(): Search for ${parentURL} failed`);
            return;
        }

        // TODO If the tabURL matches a node already in the BunnyHole, link an alias to that node instead of making a new one.
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