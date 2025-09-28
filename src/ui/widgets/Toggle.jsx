import React from "react";
import ReactDOM from "react-dom";
import "./toggle.css";

function Toggle(name) {
    return <div className="toggle">
        <input type="checkbox" name={name} id={name} />
        <label className="slider" htmlFor={name} />
    </div>
}

export default Toggle;