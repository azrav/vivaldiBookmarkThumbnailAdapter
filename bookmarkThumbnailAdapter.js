/* Bookmark Thumbnail Adapter */

var thumbDB = {};           //Thumbnail database to store images
var addrFields = {};        //Map of address field element(s) using their DOMPaths as key
var cyclesTillRefresh = 10; //No. of cycles till Data update
var cycles = 10;            //No. of cycles counting
var uID = 0;                //Unique ID counter for tracking address field elements

//API Keys
//---
//  Self-insert for your Youtube API_KEY for your own use.
//  I'm still trying to figure the quota for this.
var youtubeAPIKey = '{YOUTUBE_API_KEY}';
var giphyPublicBetaKey = 'dc6zaTOxFJmzC';   //yay

//Set image source, and cache it with trimmed bookmarkUrl
function setImgSrc(img, srcUrl, bookmarkUrl) {
    img.src = srcUrl;
    thumbDB[bookmarkUrl] = srcUrl;
    console.log('cached ',bookmarkUrl,'->',srcUrl)
}

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
function testImage(bookmarkUrl, url, found, fallback) {
    var tester=new Image();
    tester.onload = ()=>{
        found(bookmarkUrl, tester);
    };
    tester.onerror=fallback;
    tester.src=url;
}

//DOMPath helper
//  https://stackoverflow.com/questions/12644147/getting-element-path-for-selector#answer-22072325
function dompath(element) {
    var path = '',
    i, innerText, tag, selector, classes;

    for (i = 0; element && element.nodeType == 1; element = element.parentNode, i++) {
        innerText = element.childNodes.length === 0 ? element.innerHTML : '';
        tag = element.tagName.toLowerCase();
        classes = element.className;

        // Skip <html> and <body> tags
        if (tag === "html" || tag === "body")
            continue;

        if (element.id !== '') {
            // If element has an ID, use only the ID of the element
            selector = '#' + element.id;

            // To use this with jQuery, return a path once we have an ID
            // as it's no need to look for more parents afterwards.
            //return selector + ' ' + path;
        } else if (classes.length > 0) {
            // If element has classes, use the element tag with the class names appended
            selector = tag + '.' + classes.replace(/ /g , ".");
        } else {
            // If element has neither, print tag with containing text appended (if any)
            selector = tag + ((innerText.length > 0) ? ":contains('" + innerText + "')" : "");
        }

        path = ' ' + selector + path;
    }
    return path;
}

//Youtube-Vimeo code logic taken from
//  https://github.com/deponeWD/video
function processYoutubeVimeo(img, url)
{
    let matches = url.match(/(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);
    if (matches && matches.length > 6)
    {
        let vID = matches[6];
        if (matches[3].indexOf('youtu') > -1)
        {
            //Check if this is a playlist
            matches = url.match(/^.*playlist\?list=([A-Za-z0-9._%-]*)(\&\S+)?$/)
            if (matches) {
                let playlistID = matches[1];

                // https://developers.google.com/youtube/v3/docs/playlists/list
                getJSON('https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=' + playlistID +'&key=' + youtubeAPIKey,
                (err, data) => {
                    let parsedData = JSON.parse(data);
                    let thumb = parsedData.items[0].snippet.thumbnails.default.url;
                    setImgSrc(img, thumb, url);
                });
                return true;
            }

            //Check if this is a channel
            matches = url.match(/^.*channel\/([A-Za-z0-9._%-]*)(\&\S+)?$/)
            if (matches) {
                let channelID = matches[1];

                // https://developers.google.com/youtube/v3/docs/channels/list
                getJSON('https://www.googleapis.com/youtube/v3/channels?part=snippet&id=' + channelID + '&key=' + youtubeAPIKey,
                (err, data) => {
                    let parsedData = JSON.parse(data);
                    let thumb = parsedData.items[0].snippet.thumbnails.default.url;
                    setImgSrc(img, thumb, url);
                });
                return true;
            }

            //Otherwise, assume that it's a video url
            let thumb = 'https://img.youtube.com/vi/' + vID + '/maxresdefault.jpg';
            setImgSrc(img, thumb, url);
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
                setImgSrc(img, thumb, url);
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
            // https://developers.facebook.com/docs/instagram/embedding
            let thumb = url + "/media";
            setImgSrc(img, thumb, url);
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

        // https://developers.giphy.com/docs/api/endpoint#search
        getJSON('https://api.giphy.com/v1/gifs/search?q=' + user + '&limit=1&api_key=' + giphyPublicBetaKey,
        (err, data) => {
            let parsedData = JSON.parse(data);
            let thumb = parsedData.data[0].user.avatar_url;
            setImgSrc(img, thumb, url);
        });
        return true;
    }

    matches = url.match(/giphy.com\/gifs\/([A-Za-z0-9_-]+)$/);
    if (matches != null)
    {
        let trail = matches[1];
        let id = trail.substr(trail.lastIndexOf('-')+1);
        let thumb = 'https://media3.giphy.com/media/' + id + '/giphy.gif';
        setImgSrc(img, thumb, url);
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
        let success = (bookmarkUrl, foundImage)=>{
            let thumb = foundImage.src;
            setImgSrc(img, thumb, bookmarkUrl);
        }

        //Note: You can reorder which image-type to grab first
        testImage(url, userUrl+'.gif', success, ()=> {
            testImage(url, userUrl+'.png', success, ()=> {
                testImage(url, userUrl+'.jpg', success, ()=> {
                    //unhandled case, exhausted all known types
                });
            });
        });
        return true;
    }

    //Fallback to oembed method
    matches = url.match(/^.*(deviantart\.com\/[A-Za-z0-9_-]+\/(art\/[A-Za-z0-9_-]+|.*#\/\d*)|(fav\.me\/[A-Za-z0-9_-]+|sta\.sh\/[A-Za-z0-9_-]+))$/);
    if (matches)
    {   
        // https://www.deviantart.com/developers/oembed#depths
        getJSON('https://backend.deviantart.com/oembed?url=' + url,
        (err, data) => {
            let parsedData = JSON.parse(data);
            let thumb = parsedData.thumbnail_url;
            setImgSrc(img, thumb, url);
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
            let thumb = 'https://picon.ngfiles.com/' + culled + '/flash_' + id + '.png';
            setImgSrc(img, thumb, url);
        }
        else if (type == 'audio/listen') {
            let culled = parseInt(id);
            culled = '' + Math.floor(culled / 1000);
            let thumb = 'https://aicon.ngfiles.com/' + culled + '/' + id + '.png';
            setImgSrc(img, thumb, url);
        }
        //other format WIP
        return true;
    }
    return false;
}

//Process url to populate desired thumbnail
function parseUrl (img, url) {
    if (url == '')
        return;

    //Trim backslash
    while (url.endsWith('/'))
        url = url.slice(0,-1);

    //If url was cached, pull a cached image-url
    if (thumbDB.hasOwnProperty(url)) {
        img.src = thumbDB[url];
        return;
    }
    // console.log('parseUrl process', url);

    //Process unrecognized url
    //  leave if operation is done or delegated
    if (processYoutubeVimeo(img,url))   return;
    if (processInsta(img, url))         return;
    if (processGiphy(img, url))         return;
    if (processDeviantArt(img, url))    return;
    if (processNewgrounds(img, url))    return;
}

//Main update loop
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
            var url = urlField.value;
            while (url.endsWith('/'))   //trim backslash
                url = url.slice(0, -1);

            let fieldPath = dompath(urlField);

            //Is this field being tracked?
            if (addrFields.hasOwnProperty(fieldPath))
            {
                //Element present, persist its life
                addrFields[fieldPath].alive = true;

                //Same address from before, leave
                if (addrFields[fieldPath].last == url)
                    return;
            }
            //No, track it
            else {
                addrFields[fieldPath] = {
                    element: urlField,
                    alive: true,
                    track: ++uID //Increment unique-ID counter
                };
                // console.log('track', fieldPath);
            }

            //Set alive (as in present)
            addrFields[fieldPath].last = urlField.value;

            //Do the thing
            parseUrl(img, url);
        }
    });

    //Data update
    //  When this refresh is called, it clears all dead address-element references.
    //  Each reference is used to track for address text value difference when they were alive.
    if (++cycles > cyclesTillRefresh) {
        cycles = 0;

        //Gather expired fields to remove
        let toRemove = []
        for (let key of Object.keys(addrFields)) {
            if (!addrFields[key].alive)
                toRemove.push(key);
            addrFields[key].alive = false;
        }
        //Stop tracking expired fields
        toRemove.forEach((key, index)=>{
            delete addrFields[key];
            // console.log('untrack', key);
        })
    }
}

//Run update loop
var bookmarkThumbnailAdapter = setInterval(adaptBookmarkThumbnails, 1000);
