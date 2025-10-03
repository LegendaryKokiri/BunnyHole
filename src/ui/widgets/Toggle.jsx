import React from "react";
import ReactDOM from "react-dom";
import "./toggle.css";

function Toggle({ onChange, name, ref }) {
    return <div className="toggle">
        <input onChange={onChange} type="checkbox" name={name} id={name} ref={ref} />
        <label className="slider" htmlFor={name} />
    </div>
}

export default Toggle;