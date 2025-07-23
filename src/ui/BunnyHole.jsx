import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { ROOT_NODE_TITLE, ROOT_NODE_URL } from "../modules/bunny_hole.mjs";
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
        <div className="bunnyNode" style={{marginLeft: `${depth * 24}px`}}>
            {data.title === ROOT_NODE_TITLE
                ? <></>
                : <>
                    <a className="bunnyNodeTitle" href={data.url}>{data.title}</a>
                    <textarea className="bunnyNodeInput" name="Notes" rows="4" cols="88"></textarea>
                </>
            }
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