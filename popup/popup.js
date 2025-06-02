import { MESSAGE_NEW } from "../modules/constants.mjs";

/* ************* *
 * I/O FUNCTIONS *
 *****************/

function createNewBunnyHole() {
    browser.runtime.sendMessage(MESSAGE_NEW)
}

const newButton = document.getElementById("button-new");
newButton.addEventListener("click", createNewBunnyHole)