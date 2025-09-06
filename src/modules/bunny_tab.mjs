class BunnyTab {
    #id = -1;
    #title = "";
    #url = "";

    constructor(id, title, url) {
        this.#id = id;
        this.#title = title;
        this.#url = this.#parseUrl(url);
    }

    get id() {
        return this.#id;
    }
    
    get title() {
        return this.#title;
    }

    get url() {
        return this.#url;
    }

    /**
     * @param {{ title: string; url: string; }} valueObj
     */
    set values(valueObj) {
        this.#title = valueObj.title;
        this.#url = valueObj.url;
    }

    toString() {
        return `[BunnyTab "${this.#title}"]`
    }

    #parseUrl(url) {
        return url.split("#")[0]; // Remove named anchor
    }

}

export default BunnyTab;