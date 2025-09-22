/* ************* *
 * MESSAGE TYPES *
 *****************/
export const MessageTypes = Object.freeze({
    BH:          1,
    IO:          2,
    UI:          4
});

export const IOCommands = Object.freeze({
    NEW:      1001,
    OPEN:     1002,
    LOAD:     1003,
    SAVE:     1004,
    COMPLETE: 1005
});

export const UICommands = Object.freeze({
    ADD_BH_NODE:     2001,
    EDIT_BH_NODE:    2002,
    EDIT_BH_NOTES:   2003,
    SWAP_BH_NODES:   2004,
    DELETE_BH_NODE:  2005,
    FREEZE_BH:       2006
});

export function buildBHMessage(bunnyHoleJsObj) {
    return {
        type: MessageTypes.BH,
        content: bunnyHoleJsObj
    };
}

export function buildIONewMessage() {
    return {
        type: MessageTypes.IO,
        command: IOCommands.NEW
    }
}

export function buildIOOpenMessage(file) {
    return {
        type: MessageTypes.IO,
        command: IOCommands.OPEN,
        content: { file: file }
    }
}

export function buildIOLoadMessage() {
    return {
        type: MessageTypes.IO,
        command: IOCommands.LOAD
    }
}

export function buildIOSaveMessage() {
    return {
        type: MessageTypes.IO,
        command: IOCommands.SAVE
    }
}

export function buildUIAddMessage(path) {
    return {
        type: MessageTypes.UI,
        command: UICommands.ADD_BH_NODE,
        content: {path: path}
    }
}

export function buildUIEditMessage(path, title, url) {
    return {
        type: MessageTypes.UI,
        command: UICommands.EDIT_BH_NODE,
        content: {path: path, title: title, url: url}
    };
}

export function buildUINotesMessage(path, notes) {
    return {
        type: MessageTypes.UI,
        command: UICommands.EDIT_BH_NOTES,
        content: {path: path, notes: notes}
    }
}

export function buildUIDeleteMessage(path) {
    return {
        type: MessageTypes.UI,
        command: UICommands.DELETE_BH_NODE,
        content: {path: path}
    };
}

export function buildUISwapMessage(srcPath, dstPath) {
    const msgContent = {
        srcPath: srcPath,
        dstPath: dstPath
    };

    return {
        type: MessageTypes.UI,
        command: UICommands.SWAP_BH_NODES,
        content: msgContent
    };
}

export function buildUIFreezeMessage() {
    return {
        type: MessageTypes.UI,
        command: UICommands.FREEZE_BH,
    }
}

export function validateMessage(message, targetType) {
    if(!Object.hasOwn(message, "type")) return false;
    if((message.type & targetType) !== 0) return false;
    return true;
}
