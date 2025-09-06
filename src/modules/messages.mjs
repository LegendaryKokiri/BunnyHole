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
    SAVE:     1002,
    LOAD:     1003,
    LOAD:     1004,
    COMPLETE: 1005
});

export const UICommands = Object.freeze({
    EDIT_BH_NODE:    2001,
    SWAP_BH_NODES:   2002,
    DELETE_BH_NODE:  2003
});

export function buildBHMessage(bunnyHoleJsObj) {
    return {
        type: MessageTypes.BH,
        content: bunnyHoleJsObj
    };
}

export function buildIOMessage(ioCommand) {
    return {
        type: MessageTypes.IO,
        command: ioCommand
    };
}

export function buildUIEditMessage(path, title, url) {
    return {
        type: MessageTypes.UI,
        command: UICommands.EDIT_BH_NODE,
        content: {path: path, title: title, url: url}
    };
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

export function validateMessage(message, targetType) {
    if(!Object.hasOwn(message, "type")) return false;
    if((message.type & targetType) !== 0) return false;
    return true;
}
