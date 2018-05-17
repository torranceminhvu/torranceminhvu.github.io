const LINK_PREFIX = 't3';
const baseRedditUrl = 'https://www.reddit.com';
const frontPageUrl = 'https://www.reddit.com/r/QidianUnderground/.json?limit=100';

const LOHP_IDENTIFIER = [
    'library of',
    'library',
    'lohp'
];

function getRedditJson(url) {
    return new Promise(function (resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                resolve(xhttp.responseText);
            } else if (xhttp.readyState === 4 && xhttp.status !== 200) {
                reject(Error("Error fetching json from url."));
            }
        };
        xhttp.open('GET', url, true);
        xhttp.send();
    });
}

function ParseAndDisplayJson(data) {
    var div = document.getElementById('content');
    var json = JSON.parse(data);
    var nextPageIndex = json.data.after;
    var count = json.data.dist;
    var posts = json.data.children;

    for (var i = 0; i < count; i++) {
        if (posts[i].kind === LINK_PREFIX && hasNovelName(posts[i].data.title.toLowerCase(), LOHP_IDENTIFIER)) {
            var permalinkAnchor = document.createElement('a');
            permalinkAnchor.innerHTML = posts[i].data.title;
            permalinkAnchor.href = baseRedditUrl + posts[i].data.permalink;
            permalinkAnchor.target = '_blank'; // force new tab on click

            var chapterAnchor = document.createElement('a');
            chapterAnchor.innerHTML = 'Chapter';
            chapterAnchor.href = posts[i].data.url;
            chapterAnchor.target = '_blank'; // force new tab on click

            var tr = createTrWithContent([createTdWithContent(permalinkAnchor), createTdWithContent(chapterAnchor)]);
            div.appendChild(tr);
            //div.appendChild(document.createElement('br'));
        }
    }

    // go until end of reddit history
    if (nextPageIndex != null) {
        getRedditJson(`${frontPageUrl}&after=${nextPageIndex}`)
            .then(function (data2) {
                ParseAndDisplayJson(data2);
            }, function (error) {
                console.error(error);
            });
    }
}

function createTdWithContent(content) {
    var td = document.createElement('td');
    td.appendChild(content);
    return td;
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

function startApp() {
    getRedditJson(frontPageUrl)
        .then(function (data) {
            ParseAndDisplayJson(data);
        }, function (error) {
            console.error(error);
        });
}

startApp();