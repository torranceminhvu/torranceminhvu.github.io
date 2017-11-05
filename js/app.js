var csvData = undefined;
var rows = undefined;
var cols = undefined;
var hideList = undefined;
var skipList = undefined;
// defaults to true since radio is defaulted to "On"
var autoAnswerEnabled = true;
// previous state of autoAnswerEnabled
var oldAnswerEnabled = true;

function startApp(event) {
    // convert input string of column numbers to int
    hideList = ($('#hide').val() === '') ? [] : $('#hide').val().split(",").map(function(x) {
        return parseInt(x, 10) - 1;
    });
    skipList = ($('#skip').val() === '') ? [] : $('#skip').val().split(",").map(function(x) {
        return parseInt(x, 10) - 1;
    });

    // skipList should also include hideList, this takes the union of both lists
    skipList = [...new Set([...hideList, ...skipList])];

    // load data from csf file and construct test
    getCsvData(event).then(function() {
        var headerRow = csvData[0];
        csvData = shuffle(csvData.splice(1));
        csvData.splice(0, 0, headerRow);

        createHeaderRow();
        createDataRows();
        autosize($('textarea'));

    }, function(err) {
        console.log(err);
    });
}

// load data from csv file and populate csvData as a 2D array and initialize number of rows and columns the csv has
function getCsvData(event) {
    return new Promise(function(resolve, reject) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();

            reader.onload = function(event) {
                csvData = $.csv.toArrays(event.target.result);
                rows = csvData.length;
                cols = csvData[0].length;
                resolve();
            }

            reader.readAsText(file, 'UTF-8');
        } else {
            reject(Error("File could not be read."));
        }
    })
}

// create header row from csv
function createHeaderRow() {
    $('<tr/>', {
        id: `header`
    }).appendTo('#content');

    for (var i = 0; i < cols; i++) {
        // check if we should show this column when constructing our test
        if (hideList.indexOf(i) === -1) {
            $('<th/>', {
                text: csvData[0][i]
            }).appendTo('#header');
        }
    }
}


// create the rows that holds data from the csv
function createDataRows() {
    var hintIndex = undefined;
    var skipFound = false;
    // loop through rows in csv
    for (var i = 1; i < rows; i++) {
        // randomize a column to show as a hint
        hintIndex = Math.floor(Math.random() * cols);
        while (true) {
            skipList.forEach(function(skipCol) {
                if (hintIndex === skipCol) {
                    hintIndex = Math.floor(Math.random() * cols);

                    // signal that we need to loop again to check if hintIndex is in skipList
                    skipFound = true;
                }
            });

            if (!skipFound) {
                // found hintIndex that is not in skipList, so break out of loop
                break;
            } else {
                // continue loop
                skipFound = false;
            }
        }

        // create a new row to append <td> to
        $('<tr/>', {
            id: `row-${i}`
        }).appendTo('#content');

        // loop through columns of each row
        for (var j = 0; j < cols; j++) {
            // check if we should show this column when constructing our test
            if (hideList.indexOf(j) === -1) {
                $('<td/>', {
                    id: `td-${i}-${j}`
                }).appendTo(`#row-${i}`);

                // hint column
                if (hintIndex === j) {
                    $('<h5/>', {
                        id: `data-${i}-${j}`,
                        text: csvData[i][j]
                    }).appendTo(`#td-${i}-${j}`);
                } else { // column for user to fill out
                    $('<textarea/>', {
                        id: `data-${i}-${j}`,
                        // type: 'text',
                        rows: 1,
                        cols: 20,
                        placeholder: csvData[0][j]
                    }).appendTo(`#td-${i}-${j}`);
                }
            }
        }
        addShowHideButton(`#row-${i}`, i);
        addCollapsedRow('#content', i);
    }
}

// add a button that will show/hide the answer
function addShowHideButton(idToAppendTo, row) {
    $('<td/>', {
        id: `td-button-${row}`
    }).appendTo(idToAppendTo);

    $('<div/>', {
        class: 'btn btn-primary',
        id: `button-${row}`,
        type: 'button',
        tabindex: "0",
        // old bootstrap rules for collapsible
        // 'data-toggle': 'collapse',
        // 'data-target': `#collapse-${row}`,
        // 'aria-expanded': 'false',
        // 'aria-controls': `#collapse-${row}`,
        click: function() {
            $(`#collapse-${row}`).toggleClass("display-show");
            $(`#collapse-${row}`).toggleClass("display-hide");
        },
        text: '+'
    }).appendTo(`#td-button-${row}`);

    // // allow user to hit enter to trigger button
    // $(`#td-button-${row}`).keypress(function(event) {
    //     // 13 == enter key
    //     if (event.which == 13) {
    //         $(`#button-${row}`).click();
    //     }
    //     console.log(event.which);
    // });

    // if "On"
    if (autoAnswerEnabled) {
        // simulate button click when user tabs over the button div and if user
        // tabs again it will close the button div sinde its another key event
        $(`#td-button-${row}`).on('keyup keydown', function(e) {
            // 9 == tab key
            if (e.which == 9) {
                $(`#button-${row}`).click();
            }
        });
    }
}

// add an invisble row to the table that will only show when ShowHideButton is clicked
// <tr class="collapse" id="collapseExample"></tr>
function addCollapsedRow(idToAppendTo, row) {
    $('<tr/>', {
        // class: 'collapse red-border',
        class: 'red-border display-hide',
        id: `collapse-${row}`
    }).appendTo(idToAppendTo);

    // loop through columns
    for (var i = 0; i < cols; i++) {
        // check if we should show this column when constructing our test
        if (hideList.indexOf(i) === -1) {
            $('<td/>', {
                id: `td-collapse-${row}`,
                text: csvData[row][i]
            }).appendTo(`#collapse-${row}`);
        }
    }
}

// reshuffle hints for current test
function reset() {
    if (confirm('Are you sure you want to reshuffle the current test?')) {
        $('#content').empty();

        var headerRow = csvData[0];
        csvData = shuffle(csvData.splice(1));
        csvData.splice(0, 0, headerRow);

        createHeaderRow();
        createDataRows()
    }
}


// reloads the page
function reloadPage() {
    if (confirm('Are you sure you want to reload the page?')) {
        location.reload();
    }
}

// shuffles an array
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// toggles auto answers on and off depending on user's selection
function toggleAutoAnswer(myRadio) {
    // converts to boolean
    autoAnswerEnabled = (myRadio.value == 'true')

    // if user has loaded an csv file and the new option is not the same as the old option
    if (csvData !== undefined && oldAnswerEnabled !== autoAnswerEnabled) {
        oldAnswerEnabled = autoAnswerEnabled;

        if (autoAnswerEnabled) {
            for (i = 1; i < rows; i++) {
                // needs to be in closure so each onclick get its own "i", or else they all share the same.
                (function (i) {
                    $(`#td-button-${i}`).on('keyup keydown', function(e) {
                        if (e.which == 9) {
                            $(`#button-${i}`).click().bind(i);
                        }
                    })
                })(i);
            }
        } else {
            for (i = 1; i < rows; i++) {
                $(`#td-button-${i}`).off('keyup keydown');
            }
        }
    }
}