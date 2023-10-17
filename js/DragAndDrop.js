var jsonTextArea = document.getElementById("jsonTextArea");
var jsonFile = null;
var jsonString = null;

jsonTextArea.ondragover = function () {
    this.classList.add("hover");
    return false;
};

jsonTextArea.ondragend = function () {
    this.classList.remove("hover");
    return false;
};

jsonTextArea.ondrop = function (e) {
    this.classList.remove("hover");
    
    e.preventDefault();

    var file = e.dataTransfer.files[0],
        reader = new FileReader();

    reader.onload = function (event) {
        try {
            jsonString = event.target.result;

            jsonFile = JSON.parse(event.target.result);

            if (!window.searchFriendly.checked)
                jsonTextArea.value = jsonString;

            console.log(jsonFile);
            window.initialiseCombatLog();
            window.setupChart();
        }
        catch (error) {
            jsonTextArea.value = "Not a valid combat log. 💩💩💩"
            console.error(error);
        }
    };

    reader.readAsText(file);

    return false;
};

jsonTextArea.addEventListener("input", function (event) {
    
    event.preventDefault();

    try {
        jsonString = event.target.value;
        jsonFile = JSON.parse(event.target.value);

        jsonTextArea.value = window.searchFriendly.checked ? "" : jsonString;

        console.log(jsonFile);
        window.initialiseCombatLog();
        window.setupChart();
    }
    catch (error) {
        console.error(error);
    }
});