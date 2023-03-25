var storedKeyName = "isDarkMode";
var storedKey = 0;

var useDarkMode = document.getElementById("checkbox-checked-darkmode");
var formCheckLabels = document.getElementsByClassName("form-check-label");
var cardBodies = document.getElementsByClassName("card-body");

var bgColor = "";
var textColor = "";

var blackColorCode = "black"; // for setting through styles instead of class such as form focus
var whiteColorCode = "whitesmoke"; // for setting through styles instead of class such as form focus

var darkModeBgString = "darkmode-bg";
var darkModeTextString = "darkmode-text";
var lightModeBgString = "lightmode-bg";
var lightmodeTextString = "lightmode-text";

window.onload = function(evt) {

    storedKey = localStorage.getItem(storedKeyName);

    if (!storedKey) {
        localStorage.setItem(storedKeyName, 0);
        storedKey = 0;
    }

    useDarkMode.checked = storedKey == 0 ? false : true;

    toggleDarkMode(useDarkMode.checked);
}

function toggleDarkMode(enabled = false) {

    resetStyles();

    bgColor = enabled ? darkModeBgString : lightModeBgString;
    textColor = enabled ? darkModeTextString : lightmodeTextString;

    document.body.style.backgroundColor = enabled ? blackColorCode : whiteColorCode;

    window.jsonTextArea.classList.add(bgColor, textColor);
    window.inputInstanceID.classList.add(bgColor, textColor);

    _.forEach(formCheckLabels, (label) => {
        label.classList.add(bgColor, textColor);
    });

    _.forEach(cardBodies, (cardBody) => {
        cardBody.classList.add(bgColor, textColor);
    });

    if (window.jsonFile) {
        var rowEntries = document.getElementsByClassName("border-opacity-10");

        _.forEach(rowEntries, (entry) => {
            entry.classList.add(enabled ? "border-light" : "border-dark");
        })
    }

    if (window.characterFilters) {
        _.forEach(characterFilters, (button) => {

            if (button.classList.contains("btn-success") || button.classList.contains("btn-danger"))
                return;

            button.classList.add(useDarkMode.checked ? "btn-outline-light" : "btn-outline-dark");
        });
    }
}

function resetStyles() {
    window.jsonTextArea.style = "";

    if (bgColor > 0 || textColor.length > 0) {
        window.jsonTextArea.classList.remove(bgColor, textColor);
        window.inputInstanceID.classList.remove(bgColor, textColor);

        _.forEach(formCheckLabels, (label) => {
            label.classList.remove(bgColor, textColor);
        });

        _.forEach(cardBodies, (cardBody) => {
            cardBody.classList.remove(bgColor, textColor);
        });

        if (window.jsonFile) {
            var rowEntries = document.getElementsByClassName("border-opacity-10");
    
            _.forEach(rowEntries, (entry) => {
                entry.classList.remove(useDarkMode.checked ? "border-dark" : "border-light");
            })
        }

        if (window.characterFilters) {
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
    localStorage.setItem(storedKeyName, evt.currentTarget.checked ? 1 : 0)
    toggleDarkMode(evt.currentTarget.checked);
});

window.jsonTextArea.addEventListener("focus", function () {
    this.style.backgroundColor = useDarkMode.checked ? blackColorCode : whiteColorCode;  
    this.style.color = useDarkMode.checked ? whiteColorCode : blackColorCode;
});