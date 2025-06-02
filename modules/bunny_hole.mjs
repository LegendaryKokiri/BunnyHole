// TODO: Scoping! None of these fields should be able to be set outside of the class.
const ROOT_ID = "ROOT_NODE";

function isUndefined(value) {
    return typeof value === "undefined"
}

class BunnyHole {
    #id = ROOT_ID;
    #url = undefined;
    #parent = undefined;
    #children = [];

    createNode(tabID, tabURL, parentID = undefined) {
        const parentNode = isUndefined(parentID) ? this : this.searchById(parentID);
        if(isUndefined(parentNode)) {
            console.error("BunnyHole.createNode(): Could not locate parent ID " + parentID + " in the given Bunny Hole");
            return;
        }

        const newNode = new BunnyHole();
        newNode.#id = tabID;
        newNode.#url = tabURL;
        newNode.#parent = parentNode;
        parentNode.#children[parentNode.#children.length] = newNode;

        this.print();
    }

    searchById(id) {
        console.log(`Checking ${this.#id} against ${id}`);
        if(this.#id === id) return this;
        console.log(`Searching ${this.#children.length} children for ${id}`);

        for (let i = 0; i < this.#children.length; i++) {
            const searchResult = this.#children[i].searchById(id);
            if(!isUndefined(searchResult)) return searchResult;
        }
    }

    toString() {
        return `<BunnyNode ID=${this.#id}> (${this.#children.length})` 
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