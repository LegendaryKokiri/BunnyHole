import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { ROOT_NODE_TITLE, ROOT_NODE_URL } from "../modules/bunny_hole.mjs";
import { buildUIDeleteMessage, buildUISwapMessage, validateMessage } from "../modules/messages.mjs";
import "./bunnyhole.css";

// TODO: Reorganize these constants. Please.
// TODO: Standardize difference between "Class" and "ClassName" in variable names

const NEST_CLASS = ".bunnyHole > .nestMarker";
const DIVIDER_CLASS = ".bunnyNode .divider";
const SEPARATOR_CLASS = ".nodeSeparator";
const REPOSITION_CLASS = ".nodeSeparator .repositionButton";

const REPOSITION_MARKER = "repositionActive";
const NODE_PATH_DELIMETER = "_";

const DRAG_MARKER = "draggingThis"; // TODO: Refactor to name that generalizes across reposition and drag
const DRAG_TARGET_MARKER = "dragTarget"; // TODO: Refactor to name that generalizes across reposition and drag
const DEPTH_MARKER = "nodeDepth";

const PATH_CLASSNAME = "nodePath";

/* ******************** *
 * REPOSITION UTILITIES *
 ************************/

function parsePath(target) {
    for(const c of target.classList) {
        if(!c.startsWith(PATH_CLASSNAME)) continue;
        const pathStrings = c.substring(PATH_CLASSNAME.length).split(NODE_PATH_DELIMETER);
        return pathStrings.map((str) => parseInt(str));
    }

    return [];
}

/* *********************** *
 * TWO-CLICK REPOSITIONING *
 ***************************/

function beginReposition(pathClass) {
    const moving = document.querySelector(`${SEPARATOR_CLASS}:is(.${pathClass})`);
    moving.classList.add(DRAG_MARKER);

    const targets = document.querySelectorAll(`${SEPARATOR_CLASS}:not(.${pathClass})`);
    targets.forEach((item) => {
        item.classList.add(REPOSITION_MARKER);
    });
    console.log(`Added ${REPOSITION_MARKER} to ${targets.length} element(s)`);
}

// TODO: Standardize difference between "Class" and "ClassName" in variable names
// For example, "pathClass" maybe should be "pathClassname" since it doesn't come with a leading dot
function completeReposition(dstPath) {
    const moving = document.querySelector(`${SEPARATOR_CLASS}:is(.${DRAG_MARKER})`);
    const srcPath = parsePath(moving);
    console.log(srcPath);
    console.log(dstPath);

    const uiMessage = buildUISwapMessage(srcPath, dstPath);
    browser.runtime.sendMessage(uiMessage);

    moving.classList.remove(DRAG_MARKER);
    const targets = [...document.querySelectorAll(SEPARATOR_CLASS)];
    targets.forEach((item) => {
        item.classList.remove(REPOSITION_MARKER);
    });
}

/* **************************** *
 * CLICK-AND-DRAG REPOSITIONING *
 ********************************/

function markDragNesting(mouseX) {
    const targets = [...document.querySelectorAll(NEST_CLASS)];
    // const targets = [...document.querySelectorAll(`${DIVIDER_CLASS}:not(.${DRAG_MARKER})`)];

    const dragTarget = targets.reduce((closest, target) => {
        const bbox = target.getBoundingClientRect();
        const nestPoint = bbox.x;
        const offset = Math.abs(mouseX - nestPoint);

        if(offset >= closest.offset) return closest;
        return { offset: offset, target: target }
    }, { offset: Number.POSITIVE_INFINITY });

    if(Object.hasOwn(dragTarget, "target")) {
        dragTarget.target.classList.add(DRAG_TARGET_MARKER);
        for(const c of dragTarget.target.classList) {
            if(!c.startsWith(DEPTH_MARKER)) continue;
            return `.${c}`;
        }
    }

    return "";
}

function markDragTarget(mouseY, depthClass) {
    const classTarget = `${DIVIDER_CLASS}${depthClass}`;
    const targets = [...document.querySelectorAll(classTarget)];
    // const targets = [...document.querySelectorAll(`${DIVIDER_CLASS}:not(.${DRAG_MARKER})`)];

    const dragTarget = targets.reduce((closest, target) => {
        const bbox = target.getBoundingClientRect();
        const midpoint = bbox.y + bbox.height / 2;
        const offset = Math.abs(mouseY - midpoint);

        if(offset >= closest.offset) return closest;
        return { offset: offset, target: target }
    }, { offset: Number.POSITIVE_INFINITY });

    if(Object.hasOwn(dragTarget, "target")) {
        dragTarget.target.classList.add(DRAG_TARGET_MARKER);
        return dragTarget.target;
    }

    return null;
}

function clearDragTargetMarkers() {
    document.querySelectorAll(NEST_CLASS).forEach((item) => {
        item.classList.remove(DRAG_TARGET_MARKER);
    });
    document.querySelectorAll(DIVIDER_CLASS).forEach((item) => {
        item.classList.remove(DRAG_TARGET_MARKER);
    });
}

function dragStart(event) {
    // TODO: Mark the corresponding bunnyNodeDivider as being dragged, not the full node
    event.target.classList.add(DRAG_MARKER);
}

function dragOver(event) {
    clearDragTargetMarkers();

    const targetDepthClass = markDragNesting(event.clientX);
    markDragTarget(event.clientY, targetDepthClass);
}

function dragEnd(event) {
    const targetDepthClass = markDragNesting(event.clientX);
    const target = markDragTarget(event.clientY, targetDepthClass);
    const draggedItem = document.querySelector(`.${DRAG_MARKER}`);
    
    const srcPath = parsePath(draggedItem);
    const dstPath = parsePath(target);

    const uiMessage = buildUISwapMessage(srcPath, dstPath);
    browser.runtime.sendMessage(uiMessage);

    event.target.classList.remove(DRAG_MARKER);
    clearDragTargetMarkers();
}

/* *************** *
 * REACT COMPONENT *
 *******************/

function BunnyHole({data, depth=0, index=0, nodePath=[]}) {
    const indent = `${Math.max(depth - 1, 0) * 24}px`;

    const depthClass = `${DEPTH_MARKER}${depth}`;

    const bunnyHole = <div className="bunnyHole" style={{marginLeft: indent}}>
        <div className={`nestMarker ${depthClass}`}></div>
        <div className="content">
            <BunnyNode data={data} depth={depth} index={index} nodePath={nodePath} />
            {
                data.children &&
                data.children.map((child, index) => {
                    return <BunnyHole key={child.reactKey}
                        data={child}
                        depth={depth + 1}
                        index={index}
                        nodePath={nodePath.concat([index])}
                    />
                })
            }
        </div>
    </div>

    
    // TODO dragOver should probably be applied only one time over the entire document, not on a per-node basis.
    useEffect(() => {
        if(depth === 0) {
            document.addEventListener("dragover", dragOver);
            document.addEventListener("dragend", dragEnd);

            return () => {
                document.removeEventListener("dragover", dragOver);
                document.removeEventListener("dragend", dragEnd);
            }
        }
    });

    return bunnyHole;
}

function BunnyNode({data, depth=0, index=0, nodePath=[]}) {
    const title = depth === 0 ? <p className="mainTitle">{data.title}</p> : <p className="title">{data.title}</p>;
    const url = depth === 0 ? <></> : <a className="url">{data.url}</a>;
    const topDivider = depth > 0 && index === 0 ? <div className={`divider ${depthClass}`}></div> : <></>;

    const depthClass = `${DEPTH_MARKER}${depth}`;
    const nodeRef = useRef(null);
    const pathString = nodePath.join(NODE_PATH_DELIMETER);
    const nodePathClass = `${PATH_CLASSNAME}${pathString}`;

    const repositionNode = () => {
        beginReposition(nodePathClass);
    }

    const promptReposition = () => {
        markRepositionTarget(nodePathClass);
    }

    const confirmReposition = () => {
        completeReposition(nodePath);
    }

    const unpromptReposition = () => {
        unmarkRepositionTargets();
    }

    const deleteNode = () => {
        browser.runtime.sendMessage(
            buildUIDeleteMessage(nodePath)
        );
    }

    // TODO: Root node button bar should not include delete or reposition buttons
    // TODO: Can we only define the SVG filters for the root node? Kinda like we only add certain event listeners for the root node?

    const buttonBar = <div className="buttonBar">
        <svg onClick={deleteNode} className="nodeButton" xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24">
            <defs>
                <filter id="dangerMask">
                    <feFlood floodColor="#ff0000" result="flood" />
                    <feComposite in="flood" in2="SourceAlpha" operator="atop" />
                </filter>
            </defs>
            <image width="100%" height="100%" href="./buttons/button-delete.png" filter="url(#dangerMask)" />
        </svg>
        <svg onClick={repositionNode} className="nodeButton" xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24">
            <defs>
                <filter id="controlMask">
                    <feFlood floodColor="#00630dff" result="flood" />
                    <feComposite in="flood" in2="SourceAlpha" operator="atop" />
                </filter>
            </defs>
            <image width="100%" height="100%" href="./buttons/button-reposition.png" filter="url(#controlMask)" />
        </svg>
    </div>

    const nodeSeparator = <div onClick={confirmReposition} className={`nodeSeparator ${nodePathClass}`}>
        <svg className={`repositionButton ${nodePathClass}`} xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24">
            <defs>
                <filter id="controlMask">
                    <feFlood floodColor="#00630dff" result="flood" />
                    <feComposite in="flood" in2="SourceAlpha" operator="atop" />
                </filter>
            </defs>
            <image width="100%" height="100%" href="./buttons/button-reposition-here.png" filter="url(#controlMask)" />
        </svg>
        {/* TODO: Double-check if removing nodePathClass from the divider will break this; check nodePathClass of the parent for CSS if it does indeed break */}
        <div className={`divider ${depthClass} ${nodePathClass}`}></div>
    </div>

    const node = <div className="bunnyNode">
        {/* {topDivider} */}
        
        {/* TODO Place the drag listener on specific UI components, not the full node */}
        <div className={`body ${nodePathClass}`} ref={nodeRef} draggable="true"> 
            <div className="heading">
                {title}
                {buttonBar}
            </div>
            {url}
            <textarea className="input" name="Notes" rows="4" cols="88"></textarea>
            {nodeSeparator}
        </div>
    </div>
    
    useEffect(() => {
        if(depth === 0) return;

        nodeRef.current.addEventListener("dragstart", dragStart);

        return () => {
            if(nodeRef.current) {
                nodeRef.current.removeEventListener("dragstart", dragStart);
            }
        }
    })

    return node;
}

export default BunnyHole