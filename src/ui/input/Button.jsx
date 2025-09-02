import React, { useState } from "react";
import ReactDOM from "react-dom"
import "./button.css";

/* ********* *
 * CONSTANTS *
 *************/
const BUTTON_CLASS_NAME = "bhButton";
const STANDARD_CLASS_NAME = `${BUTTON_CLASS_NAME} standard`;
const DANGEROUS_CLASS_NAME = `${BUTTON_CLASS_NAME} dangerous`;

function Button({ children, onClick = null }) {        
    return <button onClick={onClick}>{children}</button>
}

function ButtonStandard( { children, onClick = null} ) {
    return <Button className={STANDARD_CLASS_NAME} onClick={onClick}>{children}</Button>
}

function ButtonDangerous() { children, onClick = null }{
    return <Button className={DANGEROUS_CLASS_NAME} onClick={onClick}>{children}</Button>
}

export { ButtonStandard, ButtonDangerous };