/* Bookmark Thumbnail Adapter */

//JSON helper
function getJSON(url, callback)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = ()=> {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(null, xhr.response);
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}

//Image helper
function testImage(url, found, fallback) {
    var tester=new Image();
    tester.onload = ()=>{
        found(tester);
    };
    tester.onerror=fallback;
    tester.src=url;
}

function processYoutubeVimeo(img, url)
{
    //Regex taken from https://github.com/deponeWD/video
    let matches = url.match(/(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);
    if (matches && matches.length > 6)
    {
        let vID = matches[6];
        if (matches[3].indexOf('youtu') > -1) {
            img.src = 'https://img.youtube.com/vi/' + vID + '/maxresdefault.jpg';
        }
        else if (matches[3].indexOf('vimeo') > -1) {
            getJSON('https://vimeo.com/api/v2/video/' + vID + '.json',
            (err, data) => {
                let parsedData = JSON.parse(data);
                let thumbSRClarge = parsedData[0].thumbnail_large;

                // split url of large thumbnail at 640
                let thumbSplit = thumbSRClarge.split(/\d{3}(?=.jpg)/);
                // add 1280x720 to parts and get bigger thumbnail
                thumb = thumbSplit[0] + '1280x720' + thumbSplit[1];
                img.src = thumb;
            });
        }
        return true;
    }
    return false;
}

function processInsta(img, url)
{
    matches = url.match(/^(http:|https:|).*\.instagram\.com\/p\/[A-Za-z0-9]+$/);
    if (matches)
    {
        //Is a post
        if (url.indexOf('/p/') > -1) {
            img.src = url + "/media";
        }
        //todo: Else, its a username
        return true;
    }
    return false;
}

function processGiphy(img, url)
{
    let matches = url.match(/giphy.com\/([A-Za-z0-9_-]+)$/);
    if (matches != null)
    {
        let user = matches[1];
        publicBetaKey = 'dc6zaTOxFJmzC';
        getJSON('https://api.giphy.com/v1/gifs/search?q=' + user + '&limit=1&api_key='+publicBetaKey,
        (err, data) => {
            let parsedData = JSON.parse(data);
            console.log(parsedData);
            img.src = parsedData.data[0].user.avatar_url;
        });
        return true;
    }

    matches = url.match(/giphy.com\/gifs\/([A-Za-z0-9_-]+)$/);
    if (matches != null)
    {
        let trail = matches[1];
        let id = trail.substr(trail.lastIndexOf('-')+1);
        img.src = 'https://media3.giphy.com/media/' + id + '/giphy.gif';
        return true;
    }
    return false;
}

function processDeviantArt(img, url)
{
    let matches = url.match(/^.*deviantart\.com\/([A-Za-z0-9_-]+)$/);

    //Handle deviantArt userpage
    if (matches)
    {
        let user = matches[1];

        //DeviantArt backend API has a /user/whois endpoint, but it requires authorization
        //So I'm resorting to brute forcing image type
        var userUrl = 'https://a.deviantart.net/avatars-big/' + user[0] +'/' + user[1] + '/' + user;

        //Success callback
        let success = (foundImage)=>{
            img.src = foundImage.src;
        }
        testImage(userUrl+'.gif', success, ()=> {
            testImage(userUrl+'.png', success, ()=> {
                testImage(userUrl+'.jpg', success, ()=> {
                    //unhandled case, exhausted all known types
                });
            });
        });
        return true;
    }

    //Fallback to oembed
    matches = url.match(/^.*(deviantart\.com\/[A-Za-z0-9_-]+\/(art\/[A-Za-z0-9_-]+|.*#\/\d*)|(fav\.me\/[A-Za-z0-9_-]+|sta\.sh\/[A-Za-z0-9_-]+))$/);
    if (matches)
    {   
        getJSON('https://backend.deviantart.com/oembed?url=' + url,
        (err, data) => {
            let parsedData = JSON.parse(data);
            img.src = parsedData.thumbnail_url;
        });
        return true;
    }
    return false;
}

function processNewgrounds(img, url)
{
    let matches = url.match(/newgrounds.com\/(portal\/view|audio\/listen)\/(\d+)$/);
    if (matches)
    {
        let type = matches[1];
        let id = matches[2];
        if (type == 'portal/view') {
            let culled = parseInt(id);
            culled = '' + Math.floor(culled / 1000) + '000';
            img.src = 'https://picon.ngfiles.com/' + culled + '/flash_' + id + '.png';
        }
        else if (type == 'audio/listen') {
            let culled = parseInt(id);
            culled = '' + Math.floor(culled / 1000);
            img.src = 'https://aicon.ngfiles.com/' + culled + '/' + id + '.png';
        }
        //other format WIP
        return true;
    }
    return false;
}

function parseUrl (img, url) {
    if (processYoutubeVimeo(img,url))   return;
    if (processInsta(img, url))         return;
    if (processGiphy(img, url))         return;
    if (processDeviantArt(img, url))    return;
    if (processNewgrounds(img, url))    return;
}

function adaptBookmarkThumbnails()
{
    //Get list of bookmark cardviews
    let view = document.querySelectorAll('.addbookmark-cardwrapper .upper-half');

    //For each of those elements
    view.forEach(el => {
        //Fetch a list of its UrlInputFields & PreviewImages
        let urlField = el.querySelector('.title-and-address .fieldset .UrlField input[placeholder="Address"]');
        var img = el.querySelector('.preview .thumbnail-image img');

        //If both address and preview image elements are present
        if (urlField != null && img != null)
        {
            let url = urlField.value;
            while (url.endsWith('/'))
                url = url.slice(0, -1);
            parseUrl(img, url);
        }
    });
}

var bookmarkThumbnailAdapter = setInterval(adaptBookmarkThumbnails, 1000);
