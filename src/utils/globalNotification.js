let showGlobalNotification = null;

export function setGlobalNotification(fn) {
    showGlobalNotification = fn;
}

export function notifyGlobal(message, type = 'warning') {
    if (showGlobalNotification) {
        showGlobalNotification(message, type);
    }
}