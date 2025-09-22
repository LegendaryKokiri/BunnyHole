class BunnyTab {
    title = "";
    url = "";
    notes = "";

    constructor(title, url, notes) {
        this.title = title;
        this.url = this.#parseUrl(url);
        this.notes = notes;
    }

    set url(url) {
        this.url = this.#parseUrl(url);
    }

    toString() {
        return `[BunnyTab "${this.title}"]`
    }

    /**
     * Parses the given URL.
     * 
     * @param {string} url 
     * @returns {string} A parsed version of that url
     */
    #parseUrl(url) {
        return url.split("#")[0]; // Remove named anchor
    }

}

export default BunnyTab;