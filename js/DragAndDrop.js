var jsonTextArea = document.getElementById('jsonTextArea');
var jsonFile = null;
var jsonString = null;

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
            jsonString = event.target.result;
            jsonTextArea.value = window.showJsonFilter.checked ? event.target.result : "";
            jsonFile = JSON.parse(event.target.result);
            console.log(jsonFile);
            window.initialise();
        }
        catch (error) {
            jsonTextArea.value = "Not a JSON file. 💩💩💩"
            console.error(error);
        }
    };

    reader.readAsText(file);

    return false;
};