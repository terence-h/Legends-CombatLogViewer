// Local storage keys/values
var keyNames = ["isDarkMode", "showTags", "showJson", "moveToPanelToLeft"];
var keyValues = [null, null, null, null];

window.onload = function(evt) {

    // Add or set local storage keys/values
    _.forEach(keyNames, (key, index) => {
        keyValues[index] = localStorage.getItem(key);

        if (!keyValues[index]) {
            localStorage.setItem(key, 0);
            keyValues[index] = 0;
        }
    });

    // Toggle dark mode on/off
    window.useDarkMode.checked = keyValues[0] == 0 ? false : true;
    toggleDarkMode(window.useDarkMode.checked);

    // Show/hide tags header
    window.showTagFilter.checked = keyValues[1] == 0 ? false : true;

    if (window.showTagFilter.checked)
        createCombatLogTagHeader();

    // Show/hide json string in textarea
    window.showJsonFilter.checked = keyValues[2] == 0 ? false : true;

    if (evt.currentTarget.checked)
        window.jsonTextArea.placeholder = "Drag & Drop Combat Log JSON file here...";
    else
        window.jsonTextArea.placeholder = "JSON string is being hidden. Enjoy your Ctrl + F.\n\nDrag & Drop Combat Log JSON file here...";

    // Move control panel to left or keep it at right
    window.movePanelToLeft.checked = keyValues[3] == 0 ? false : true;

    if (window.movePanelToLeft.checked)
        window.movePanel();
}

// Ensure everything is loaded before displaying. Scuffed fix for few milliseconds of flashbang.
window.addEventListener('load', function () {
    document.body.style.removeProperty("display");
});