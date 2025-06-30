import React, { useState } from "react";
import ReactDOM from "react-dom"
import "./button.css";

export const ButtonType = Object.freeze({
    STANDARD: "buttonStandard",
    DANGEROUS: "buttonDangerous"
});

function Button({ text, onClick = null, type = ButtonType.STANDARD }) {        
    return (
        <button className={type} onClick={onClick}>{text}</button>
    )
}

export default Button;