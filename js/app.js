var csvData = undefined;
var rows = undefined;
var cols = undefined;
function start_app(event) {
    getCsvData(event).then(function() {
        createHeaderRow();

    }, function(err) {
        console.log(err);
    });

}

function getCsvData(event) {
    return new Promise(function(resolve, reject) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();

            reader.onload = function (event) {
                csvData = $.csv.toArrays(event.target.result);
                rows = csvData.length;
                cols = csvData[0].length;
                //$('#content').text(csvData.toString());
                resolve();
            }

            reader.readAsText(file, 'UTF-8');
        } else {
            reject(Error("File could not be read."));
        }
    })
}

function createHeaderRow() {
    for (var i = 0; i < cols; i++) {
        $('<th/>', {
            id: 'header-' + i,
            text: csvData[0][i]
        }).appendTo('#content');
    }
}
