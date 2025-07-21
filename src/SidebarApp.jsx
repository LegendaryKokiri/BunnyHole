import React, { useState, useEffect } from "react";
import BunnyHoleClass from "./modules/bunny_hole.mjs"
import BunnyHole from "./ui/BunnyHole.jsx";
import "./sidebar.css";

function SidebarApp() {
    const [bunnyHole, setBunnyHole] = useState(new BunnyHoleClass().jsObject);

    // TODO: Can we validate the object more cleanly than this?
    // Perhaps a function in the bunny_hole.mjs module would be better suited for this.
    const handleMessage = (message, sender, sendResponse) => {
        if(!BunnyHoleClass.validateJsObject(message)) return;        
        setBunnyHole(message);
    }

    useEffect(() => {
        browser.runtime.onMessage.addListener(handleMessage);
        // const page = browser.extension.getBackgroundPage();
        // page.exposed();
    }, []);

    return (
        <div>
            <BunnyHole bunnyHoleRootNode={bunnyHole}/>
        </div>
    )
}

export default SidebarApp;