import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./bunnyhole.css";

function BunnyHole({bunnyHoleRootNode}) {
    return (
        <div className="bunnyHole">
            <BunnyNode data={bunnyHoleRootNode} />
        </div>
    )
}

function BunnyNode({data, depth = 0}) {
    return (
        <div className="bunnyNode">
            {data.title == "<Root Node>" ? <></> : <p className="bunnyNodeTitle" >{data.title}</p>}
            {data.title == "<No URL>" ? <></> : <a className="bunnyNodeUrl">{data.url}</a>}
            <textarea className="bunnyNodeInput" name="Notes" rows="4" cols="88"></textarea>
            {
                data.children &&
                data.children.map((child) => {
                    return <BunnyNode key={child.reactKey} data={child} depth={depth + 1}/>
                })
            }
        </div>
    )
}

export default BunnyHole