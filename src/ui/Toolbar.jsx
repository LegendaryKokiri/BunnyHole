import React from "react";
import ReactDOM from "react-dom";
import "./toolbar.css";

function ToolbarButton({path, fillColor="#000000"}) {
    const button = <svg className="toolbarButton" xmlns="http://www.w3.org/2000/svg" version="1.1" width="32" height="32">
        <defs>
            <filter id={`colorMask${fillColor}`}>
                <feFlood floodColor={fillColor} result="flood" />
                <feComposite in="flood" in2="SourceAlpha" operator="atop" />
            </filter>
        </defs>
        <image width="100%" height="100%" href={path} filter={`url(#colorMask${fillColor})`} />
    </svg>

    return button;
}

function Toolbar() {
    const toolbar = <div className="toolbar">
        <div className="logo">
            <h2>Bunny Hole</h2>
        </div>
        <div className="buttons">
            <ToolbarButton path="./buttons/button-new.png" />
            <ToolbarButton path="./buttons/button-open.png" />
            <ToolbarButton path="./buttons/button-save.png" />
            <ToolbarButton path="./buttons/button-delete.png" fillColor="#000000"/>
        </div>
    </div>

    return toolbar;
}

export default Toolbar;