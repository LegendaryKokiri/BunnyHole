import React, { useState } from "react";
import ReactDOM from "react-dom"
import "./button.css";

/* ********* *
 * CONSTANTS *
 *************/

// CLASS SPECIFIERS
const BUTTON_CLASS_NAME = "bhButton";
const ButtonType = Object.freeze({
    STANDARD: "standard",
    DANGEROUS: "dangerous"
});

export { ButtonType };

/* **************** *
 * REACT COMPONENTS *
 ********************/

function ButtonConfirm({children, onClick = null}) {
    return <Button onClick={onClick} buttonType={ButtonType.STANDARD}>{children}</Button>;
}

function ButtonCancel({children, onClick = null}) {
    return <Button onClick={onClick} buttonType={ButtonType.DANGEROUS}>{children}</Button>;
}

function Button({ children, buttonType=ButtonType.STANDARD, onClick = null }) {    
    const className = `${BUTTON_CLASS_NAME} ${buttonType}`;    
    return <button onClick={onClick} className={className}>{children}</button>
}

export default Button;
export { ButtonConfirm, ButtonCancel };