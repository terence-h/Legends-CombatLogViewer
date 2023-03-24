var jsonTextArea = document.getElementById('jsonTextArea');
var jsonFile = null;

jsonTextArea.ondragover = function () {
    this.className = 'hover';
    return false;
};

jsonTextArea.ondragend = function () {
    this.className = '';
    return false;
};

jsonTextArea.ondrop = function (e) {
    this.className = '';
    e.preventDefault();

    var file = e.dataTransfer.files[0],
        reader = new FileReader();

    reader.onload = function (event) {
        try {
            jsonTextArea.value = event.target.result;
            jsonFile = JSON.parse(jsonTextArea.value);
            console.log(jsonFile);
            window.initialise();
            // jsonTextArea.value = "";
        }
        catch (error) {
            jsonTextArea.value = "DRAG AND DROP THE COMBAT LOG JSON FILE IN HERE. 💩💩💩💩💩💩💩💩💩"
            console.error("Not a JSON file. 💩💩💩");
        }
    };

    reader.readAsText(file);

    return false;
};