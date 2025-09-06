import React from "react";
import ReactDOM from "react-dom";
import "./tooltip.css";

function Tooltip({ children, text }) {
    return <div className="tooltip">
        <p className="text">{text}</p>
        {children}
    </div>
}

export default Tooltip;