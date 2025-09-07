import React from "react";
import ReactDOM from "react-dom";
import "./tooltip.css";

export const TooltipPosition = Object.freeze({
    ABOVE: "above",
    BELOW: "below"
});

function Tooltip({ children, text, position=TooltipPosition.ABOVE }) {
    const className = `tooltip ${position}`;

    return <div className={className}>
        <p className="text">{text}</p>
        {children}
    </div>
}

export default Tooltip;