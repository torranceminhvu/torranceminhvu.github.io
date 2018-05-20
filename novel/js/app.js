const BASE_REDDIT_URL = 'https://www.reddit.com';
const PUSHSHIFT_URL = 'https://api.pushshift.io/reddit/submission/search/?subreddit=QidianUnderground&limit=500';

var xhr_array = [];

const LOHP_IDENTIFIER = [
    'library of',
    'library',
    'lohp'
];

const RTW_IDENTIFIER = [
    'release that witch',
    'release the witch ',
    'rtw',
    'release'
];

const TMW_IDENTIFIER = [
    'true martial world',
    'true martial',
    'tmw'
];

const TKA_IDENTIFIER = [
    'the kin\'s avatar',
    'the kings avatar',
    'tka',
    'kings avatar',
    'king\'s avatar'
];

const BOOK_CAROUSEL = [
    LOHP_IDENTIFIER,
    RTW_IDENTIFIER,
    TMW_IDENTIFIER,
    TKA_IDENTIFIER
];

var current_book_index = 0;

function getRedditJson(url) {
    return new Promise(function (resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhr_array.push(xhttp);
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(xhttp.responseText);
            } else if (xhttp.readyState === 4 && xhttp.status !== 200 && xhttp.status !== 0) {
                reject(Error('Error fetching json from url.'));
            }
        };
        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function ParseAndDisplayJson(data, novel) {
    var div = document.getElementById('table-content');
    var json = JSON.parse(data);
    var createdUtc = null;
    var posts = json.data;

    for (var i = 0; i < posts.length; i++) {
        createdUtc = posts[i].created_utc;
        if (hasNovelName(posts[i].title.toLowerCase(), novel)) {
            var permalinkAnchor = document.createElement('a');
            permalinkAnchor.innerHTML = posts[i].title;
            permalinkAnchor.href = BASE_REDDIT_URL + posts[i].permalink;
            permalinkAnchor.target = '_blank'; // force new tab on click

            var chapterAnchor = document.createElement('a');
            chapterAnchor.innerHTML = 'Chapter';
            chapterAnchor.href = posts[i].url;
            chapterAnchor.target = '_blank'; // force new tab on click

            var chapterTr = createTrWithContent([
                createElementWithContent(permalinkAnchor, 'td', {}),
                createElementWithContent(chapterAnchor, 'td', {})
            ]);
            div.appendChild(chapterTr);
        }
    }

    // go until end of reddit history
    if (createdUtc != null) {
        getRedditJson(`${PUSHSHIFT_URL}&before=${createdUtc}`)
            .then(function (data2) {
                ParseAndDisplayJson(data2, novel);
            }, function (error) {
                console.error(error);
            });
    }
}

function createHeaderRow() {
    var div = document.getElementById('table-content');

    var headerTr = createTrWithContent([
        createElementWithContent(document.createTextNode('Title'), 'th', { id: 'title' }),
        createElementWithContent(document.createTextNode("Chapter Link"), 'th', { id: 'chapter' }),
    ]);

    div.appendChild(headerTr);
}

function createElementWithContent(content, element, config) {
    var el = document.createElement(element);
    el.appendChild(content);
    el.id = config.id;
    return el;
}

function createTrWithContent(contentArray) {
    var tr = document.createElement('tr');
    for (var index in contentArray) {
        tr.appendChild(contentArray[index]);
    }
    return tr;
}

function hasNovelName(title, titlesToMatch) {
    for (var i = 0; i < titlesToMatch.length; i++) {
        if (title.includes(titlesToMatch[i])) {
            return true;
        }
    }

    return false;
}

function clearTable() {
    var table = document.getElementById('table-content');
    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }
}

function abortAlllActiveXhrRequests() {
    if (xhr_array.length > 0) {
        for (var i = 0; i < xhr_array.length; i++) {
            xhr_array[i].abort()
        }
        xhr_array.length = 0;
    }
}

function moveCarouselLeft() {
    if (current_book_index == 0) {
        current_book_index = BOOK_CAROUSEL.length - 1;
    } else {
        current_book_index--;
    }
}

function moveCarouselRight() {
    if (current_book_index == BOOK_CAROUSEL.length - 1) {
        current_book_index = 0;
    } else {
        current_book_index++;
    }
}


function toggleLeftArrow() {
    moveCarouselLeft();
    abortAlllActiveXhrRequests();
    clearTable();
    startApp(BOOK_CAROUSEL[current_book_index]);
}

function toggleRightArrow() {
    moveCarouselRight();
    abortAlllActiveXhrRequests();
    clearTable();
    startApp(BOOK_CAROUSEL[current_book_index]);
}

function startApp(novel) {
    getRedditJson(PUSHSHIFT_URL)
        .then(function (data) {
            createHeaderRow();
            ParseAndDisplayJson(data, novel);
        }, function (error) {
            console.error(error);
        });
}

startApp(LOHP_IDENTIFIER);