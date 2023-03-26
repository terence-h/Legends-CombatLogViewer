var useDarkMode = document.getElementById("checkbox-checked-darkmode");
var formCheckInputs = document.getElementsByClassName("form-check-input");
var formCheckLabels = document.getElementsByClassName("form-check-label");
var cardBodies = document.getElementsByClassName("card-body");
var hiddenScrolls = document.getElementsByClassName("hidden-scroll");
var versioning = document.getElementById("versioning");

var bgColor = "";
var textColor = "";

var blackColorCode = "black"; // for setting through styles instead of class such as form focus
var whiteColorCode = "whitesmoke"; // for setting through styles instead of class such as form focus
var checkBoxDarkModeCode = "checkbox-darkmode";

var darkModeBgString = "darkmode-bg";
var darkModeTextString = "darkmode-text";
var lightModeBgString = "lightmode-bg";
var lightmodeTextString = "lightmode-text";

function toggleDarkMode(enabled = false) {

    resetStyles();

    // Color mode to set
    bgColor = enabled ? darkModeBgString : lightModeBgString;
    textColor = enabled ? darkModeTextString : lightmodeTextString;

    // Body bg
    document.body.style.backgroundColor = enabled ? blackColorCode : whiteColorCode;

    // Json text area and instance filter
    window.jsonTextArea.classList.add(bgColor, textColor);
    window.inputInstanceID.style.backgroundColor = enabled ? blackColorCode : whiteColorCode;  
    window.inputInstanceID.style.color = enabled ? whiteColorCode : blackColorCode;

    // Versioning
    versioning.classList.add(textColor);

    // Check boxes. Uses different colour scheme for dark mode for visibility.
    if (enabled) {
        _.forEach(formCheckInputs, (checkBox) => {
            checkBox.classList.add(checkBoxDarkModeCode);
        });
    }

    // Check box labels
    _.forEach(formCheckLabels, (label) => {
        label.classList.add(bgColor, textColor);
    });

    // Boxes on left container
    _.forEach(cardBodies, (cardBody) => {
        cardBody.classList.add(bgColor, textColor);
    });

    // Combat log header "invisible" scroll
    _.forEach(hiddenScrolls, (hiddenScroll) => {
        hiddenScroll.classList.add(enabled ? "darkmode-hidden-scroll" : "lightmode-hidden-scroll");
        hiddenScroll.classList.remove(enabled ? "lightmode-hidden-scroll" : "darkmode-hidden-scroll");
    });

    // Json file is loaded already
    if (window.jsonFile) {
        var rowEntries = document.getElementsByClassName("border-opacity-10");

        // Update every single row entry class
        _.forEach(rowEntries, (entry) => {
            entry.classList.add(enabled ? "border-light" : "border-dark");
        })

        // Character filter buttons
        _.forEach(characterFilters, (button) => {

            if (button.classList.contains("btn-success") || button.classList.contains("btn-danger"))
                return;

            button.classList.add(useDarkMode.checked ? "btn-outline-light" : "btn-outline-dark");
        });
    }
}

function resetStyles() {
    // Clear the style of the json text area and instance ID filtering
    // window.jsonTextArea.style = "";
    // window.inputInstanceID.style = "";

    // Only remove classes if this is not the first time toggling dark mode in this session.
    if (bgColor > 0 || textColor.length > 0) {

        // Json text area and instance filter
        window.jsonTextArea.classList.remove(bgColor, textColor);
        window.inputInstanceID.style.backgroundColor = useDarkMode.checked ? blackColorCode : whiteColorCode;  
        window.inputInstanceID.style.color = useDarkMode.checked ? whiteColorCode : blackColorCode;

        // Versioning
        versioning.classList.remove(textColor);

        // Check boxes. Uses different colour scheme for dark mode for visibility.
        _.forEach(formCheckInputs, (checkBox) => {
            checkBox.classList.remove(checkBoxDarkModeCode);
        });

        // Check box labels
        _.forEach(formCheckLabels, (label) => {
            label.classList.remove(bgColor, textColor);
        });

        // Boxes on left container
        _.forEach(cardBodies, (cardBody) => {
            cardBody.classList.remove(bgColor, textColor);
        });
        
        // Json file is loaded already
        if (window.jsonFile) {
            var rowEntries = document.getElementsByClassName("border-opacity-10");
    
            // Update every single row entry class
            _.forEach(rowEntries, (entry) => {
                entry.classList.remove(useDarkMode.checked ? "border-dark" : "border-light");
            })

            // Character filter buttons
            _.forEach(characterFilters, (button) => {
                if (button.classList.contains("btn-outline-dark"))
                    button.classList.remove("btn-outline-dark");

                if (button.classList.contains("btn-outline-light"))
                    button.classList.remove("btn-outline-light");
            });
        }
    }
}

useDarkMode.addEventListener('change', function (evt) {
    // Save the dark mode toggle setting into local storage
    localStorage.setItem(keyNames[0], evt.currentTarget.checked ? 1 : 0);
    toggleDarkMode(evt.currentTarget.checked);
});

window.jsonTextArea.addEventListener("focus", function () {
    // On focus set the colour depending on current mode
    this.style.backgroundColor = useDarkMode.checked ? blackColorCode : whiteColorCode;  
    this.style.color = useDarkMode.checked ? whiteColorCode : blackColorCode;
});