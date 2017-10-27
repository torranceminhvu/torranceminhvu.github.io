var csvData = undefined;
var rows = undefined;
var cols = undefined;
function start_app(event) {
    getCsvData(event).then(function() {
        createHeaderRow();
        createDataRows()

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
    $('<tr/>', {
        id: `header`
    }).appendTo('#content');

    for (var i = 0; i < cols; i++) {
        $('<th/>', {
            text: csvData[0][i]
        }).appendTo('#header');
    }
}

function createDataRows() {
    var hintIndex = undefined;

    for (var i = 1; i < rows; i++) {
        // randomize a column to show as a hint, exception is skip column 5
        hintIndex = Math.floor((Math.random() * (cols - 1)) + 1);
        while (true) {
            if (hintIndex === 4) {
                hintIndex = Math.floor((Math.random() * (cols - 1)) + 1);
            }
            else {
               break;
           }
        }

        // create a new row to append <td> to
        $('<tr/>', {
            id: `row-${i}`
        }).appendTo('#content');
        for (var j = 0; j < cols; j++) {
            $('<td/>', {
                id: `td-${i}-${j}`
            }).appendTo(`#row-${i}`);

            if (hintIndex === j) {
                $('<h5/>', {
                    id: `data-${i}-${j}`,
                    text: csvData[i][j]
                }).appendTo(`#td-${i}-${j}`);
            } else if (j === 0) {
                $('<p/>', {
                    id: `data-${i}-${j}`,
                    text: csvData[i][j]
                }).appendTo(`#td-${i}-${j}`);
            } else {
                $('<input/>', {
                    id: `data-${i}-${j}`,
                    type: 'text',
                    placeholder: csvData[0][j]
                }).appendTo(`#td-${i}-${j}`);
            }
        }
        addShowHideButton(`#row-${i}`, i);
        addCollapsedRow('#content', i);
    }
}
//   <div class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
function addShowHideButton(idToAppendTo, row) {
    $('<td/>', {
        id: `td-button-${row}`
    }).appendTo(idToAppendTo);

    $('<div/>', {
        class: 'btn btn-primary',
        type: 'button',
        'data-toggle': 'collapse',
        'data-target': `#collapse-${row}`,
        'aria-expanded': 'false',
        'aria-controls': `#collapse-${row}`,
        text: '+'
    }).appendTo(`#td-button-${row}`);
}

// add an invisble row to the table that will only show when ShowHideButton is clicked
// <tr class="collapse" id="collapseExample"></tr>
function addCollapsedRow(idToAppendTo, row) {
    $('<tr/>', {
        class: 'collapse red-border',
        id: `collapse-${row}`
    }).appendTo(idToAppendTo);

    for (var i = 0; i < cols; i++) {
        $('<td/>', {
            id: `collapse-${row}`,
            text: csvData[row][i]
        }).appendTo(`#collapse-${row}`);
    }
}

function reset() {
    if (confirm('Are you sure you want to reshuffle the current test?')) {
        $('#content').empty();
        createHeaderRow();
        createDataRows()
    }
}

function reloadPage() {
    if (confirm('Are you sure you want to reload the page?')) {
        location.reload();
    }
}


