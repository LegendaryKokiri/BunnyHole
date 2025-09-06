import React from "react";
import ReactDOM from "react-dom";
import "./modal.css";

function Modal({ children, className }) {
    return <dialog className={className} closedby="any">
        {children}
    </dialog>
}

export default Modal;