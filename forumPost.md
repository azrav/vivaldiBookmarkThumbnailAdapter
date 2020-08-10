## Bookmark Thumbnail Adapter

A workaround mod aimed to adapt bookmark thumbnails according to their URLs.  
Here's hoping that this mod becomes obsolete _to me_. (When thumbnails gets better support)

![QueGER0KgW.gif](https://forum.vivaldi.net/assets/uploads/files/1596378734615-queger0kgw.gif)

**Why?**

The Initial intention was to cater thumbnail displays for youtube.

1. Bookmarking videos while you're traversing a playlist (say, your "Likes" to find notable videos you've liked) tend to generate inaccurate thumbnails.
2. Refreshing bookmark thumbnails leaves you with a start-of-video black screen which can be undesirable.
3. Manually setting custom thumbnails for bulks of youtube bookmark isn't scaleable (takes up space on computer, and your effort/time)

After some thought, I realize I could extend this to cover more Platforms / APIs other than Youtube.  
I'm doing this for myself, as a hobby and learning experience.

* * *

**Change Logs**

**10/8/2020 2:30pm:** Support No image and More Platforms
* Bookmarks with no thumbnails were using svg placeholder elements. This update should handle that.
* Image are styled according to their **original dimensions** and **aspect ratio**
* **Deprecate bookmarkThumbnail.css and youtubeAPIKey**
* Support for Youtube, Vimeo, Facebook, Instagram, Giphy, DeviantArt, Newgrounds, Pixiv, Steam, Osu, Wiki, Reddit, Tumblr, Fandom & Gamepedia Wikis

Some might be partial? I tried to stress test a bunch of links (Except Vimeo. Feel free to extend it if you wish, and let me know if I missed anything)

**Past Entries**
>
> > **3/8/2020 11:49:36 am:** Fixed typo
> > Youtube playlist Regex had a typo preventing it from pulling youtubeAPIKey to grab thumbnail
> > 
> > **3/8/2020 5:19:49 am:** Optimizations
> > 1. Cache and reuse thumbnails, with trimmed Bookmark-url as key. Reduce no. of JSON requests to make.
> > 2. Doesn't process needlessly when address field's text are the same. Also handled for multiple bookmark elements present.
> > 3. Experimental: Support for Youtube API Key. (Used to retrieve thumbs for channel / playlist)
> > 
> > **2/8/2020 9:49:39 pm:**
> > Partial support of few more other sites's thumbnails
> > - Youtube, Vimeo, Instagram, Giphy, DeviantArt, Newgrounds
> > 
> > 1/8/2020 3:19:59 pm: Support youtube watch?v=[videoID]

**Configuring**

* `tickRate` - Time interval between each update; _Default 1000ms_
* Thumbnails with aspect ratio >= to `coverFitThreshold` will use _cover_ for bookmark fitting. The default fitting is _contain_.

* * *

**Credits**

* deponeWD (support for various types of youtube & vimeo urls)
* sshow & jcern (for the DOM path function)
* LomN (for the inspiration and moddng references)
* Stackoverflow and Vivaldi modding communities

**Older versions & Script References**
I archive them in [Github page](https://github.com/azrav/vivaldiBookmarkThumbnailAdapter/commits/master).
I'll commit latest and edit this line later.

**Important Warning for Tinkerers**
If you intend on editing the `Bookmarks` checksum etc... please remember to backup your `Bookmarks`, `file_mapping.json` and `VivaldiThumbnails` folder before doing so.

I've had my speed dials / bookmark thumbnails reset on a couple of occasion trying to satisfy my OCD, and I think? it's best left untouched.

* * *

**Installation**  
Follow the instructions at [https://forum.vivaldi.net/topic/10549/modding-vivaldi](https://forum.vivaldi.net/topic/10549/modding-vivaldi)

*bookmarkThumbnailAdapter.js*

```
/* Bookmark Thumbnail Adapter */

var thumbDB = {};           //Thumbnail database to store images
var addrFields = {};        //Map of address field element(s) using their DOMPaths as key
var uID = 0;                //Unique ID counter for tracking address field elements

var cyclesTillRefresh = 10;     //No. of cycles till Data update
var cycles = 10;                //No. of cycles counting
var coverFitThreshold = 3.5;    //Aspect ratio more than or equal to this will use cover 
var tickRate = 1000;            //Time interval between each update; Default 1000ms

//API Keys
//---
var giphyPublicBetaKey = 'dc6zaTOxFJmzC';   //yay

// --- Image Section ---

function setImgSrc_Only(img, srcUrl)
{
    if (img == null) {
        console.log('setImgSrc_Only > WARNING: img is null');
        return;
    }

    // Check if img is not an Image element (might be a SVG)
    if (!(img instanceof HTMLImageElement))
    {
        let parent = img.parentElement; //Cache parent
        img.remove();                   //Remove image
        if (parent == null) return;     //Stop operation if it was isolated

        img = new Image();          //Create a new image set up style
        img.style.width = "100%";
        img.style.height = "auto";
        parent.appendChild(img);    //Add to parent
    }
    img.src = srcUrl;   //Set image source url

    //Image styling after successful load
    img.onload = ()=>{
        // console.log(img.naturalWidth, img.naturalHeight , img.src);

        //Center the image of the thumbnail
        img.style.objectPosition = "center";

        //If either image dimensions is smaller than element's dimension,
        //pixelate to avoid blurred image
        if (img.naturalWidth < img.offsetWidth ||
            img.naturalHeight < img.offsetHeight) {
            img.style.imageRendering = "pixelated";
        }
        else {
            img.style.imageRendering = "auto";
        }

        //Use cover if image is too horizontally long
        if ((img.naturalWidth / img.naturalHeight) < coverFitThreshold) {
            img.style.objectFit = "contain";
        }
        else {
            img.style.objectFit = "cover";
        }
    };
}

//Set image source, and cache it with trimmed bookmarkUrl
function setImgSrc(img, srcUrl, bookmarkUrl)
{
    setImgSrc_Only(img, srcUrl);
    thumbDB[bookmarkUrl] = srcUrl;  //Cache for reuse
    // console.log('cached ',bookmarkUrl,'->',srcUrl)
}

// --- Utilities / Helpers ---

//Trim away the starting segment, up to the beginning or end(inclusive) of target
function trimStart(str, target, inclusive = true)
{
    if (str == '' || target == '') {
        console.log('trimStart > ERROR: Required strings "str" or "target" are missing.');
        return str;
    }
    return inclusive
    ? str.substr(str.indexOf(target) + target.length)
    : str.substr(str.indexOf(target));
}
//Trim away the ending segment, from target onwards
function trimEnd(str, target = '"', inclusive = true)
{
    if (str == '' || target == '') {
        console.log('trimEnd > ERROR: Required strings "str" or "target" are missing.');
        return str;
    }
    let buffer = inclusive ? 0 : target.length;
    return str.substr(0, str.indexOf(target) + buffer);
}

//Request XMLHttpRequest helper
function getRequest(url, callback)
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

//Tries to load an Image.
function tryImage(bookmarkUrl, url, found, fallback)
{
    var tester = new Image();
    tester.onload = () => {
        found(bookmarkUrl, tester);
    };
    tester.onerror = fallback;
    tester.src=url;
}

//DOMPath helper
//  https://stackoverflow.com/questions/12644147/getting-element-path-for-selector#answer-22072325
function dompath(element)
{
    var path = '',
    i, innerText, tag, selector, classes;

    for (i = 0; element && element.nodeType == 1; element = element.parentNode, i++)
    {
        innerText = element.childNodes.length === 0 ? element.innerHTML : '';
        tag = element.tagName.toLowerCase();
        classes = element.className;

        // Skip <html> and <body> tags
        if (tag === "html" || tag === "body") {
            continue;
        }

        if (element.id !== '') {
            // If element has an ID, use only the ID of the element
            selector = '#' + element.id;
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

//Decode escaped characters
//  https://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript#answer-31350391
function decodeEscapedChars(encodedString)
{
    let textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;

    //Cache for return and remove textArea
    let ret = textArea.value.replace('\\', '');
    textArea.remove();
    return ret;
}

// --- Url Processing Section ---

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
            //video
            if (url.indexOf('/watch?v=') > -1) {
                setImgSrc(img, 'https://img.youtube.com/vi/' + vID + '/maxresdefault.jpg', url);
                return true;
            }

            //playlist
            if (url.indexOf('playlist?list=') > -1) {
                getRequest(url, (err, data) => {
                    let thumb = trimStart(data, '"thumbnail":{"thumbnails":[{"url":"');
                    setImgSrc(img, trimEnd(thumb), url);
                });
                return true;
            }

            //channel
            if (url.indexOf('channel/')) {
                getRequest(url, (err, data) => {
                    let thumb = trimStart(data, '"avatar":{"thumbnails":[{"url":"');
                    setImgSrc(img, trimEnd(thumb), url);
                });
                return true;
            }
            setImgSrc(img, 'https://s.ytimg.com/yts/img/favicon-vfl8qSV2F.ico', url);
            return true;
        }
        else if (matches[3].indexOf('vimeo') > -1) {
            getRequest('https://vimeo.com/api/v2/video/' + vID + '.json',
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

    //youtube favicon
    if (url.indexOf('youtube.com') > -1) {
        setImgSrc(img, 'https://s.ytimg.com/yts/img/favicon-vfl8qSV2F.ico', url);
        return true;
    }
    return false;
}

//  ... .facebook.com ...
//  www.facebook.com/username
//  www.facebook.com/photo.php?fbid=...
function processFacebook(img,url)
{
    if (url.indexOf('.facebook\.com') > -1)
    {
        //account
        if (url.match(/^.*\.facebook\.com\/[A-Za-z0-9.-=\_]+$/)) {
            getRequest(url, (err, data) => {
                //  ... xxxx&#039;s profile photo, Image may contain: 1 person" src="img-url" ...
                let thumb = trimStart(data, 'Profile Photo');
                    thumb = trimStart(thumb, 'src="');
                    thumb = decodeEscapedChars(trimEnd(thumb));
                setImgSrc(img, thumb, url);
            });
            return true;
        }

        //todo: post -> photo

        //photo
        if (url.indexOf('/photo.php?fbid=') > -1) {
            getRequest(url, (err, data) => {
                //  ... player_origin=photos" data-ploi="img-src" ...
                let thumb = trimStart(data, 'player_origin=photos" data-ploi="');
                    thumb = decodeEscapedChars(trimEnd(thumb));
                setImgSrc(img, thumb, url);
            });
            return true;
        }

        //favicon
        setImgSrc(img, 'https://www.facebook.com/images/fb_icon_325x325.png', url);
        return true;
    }

    //Other stuffs; site -> php -> image url
    return false;
}

//  www.instagram.com
//  www.instagram.com/direct/...
//  www.instagram.com/explore
//  www.instagram.com/username/...
//  www.instagram.com/p/ABcDE6ghIJK
//  ... .instagram.com ...
function processInsta(img, url)
{
    if (url.indexOf('instagram.com') > -1)
    {
        //post
        if (url.indexOf('/p/') > -1) {
            // https://developers.facebook.com/docs/instagram/embedding
            let thumb = url + "/media";
            setImgSrc(img, thumb, url);
        }
        else {
            getRequest(url, (err, data) => {
                //profile pic
                let thumb = 'profile_pic_url":"';
                if (data.indexOf(thumb) > -1) {
                    thumb = trimStart(data, thumb);
                    thumb = trimEnd(thumb);
                    thumb = JSON.parse('"' + thumb + '"');
                }
                //favicon
                else {
                    thumb = trimStart(data, 'rel="shortcut icon" href="');
                    thumb = trimEnd(thumb);
                }
                setImgSrc(img, thumb, url);
            });
        }
        return true;
    }
    return false;
}

//  ... .giphy.com ...
//  www.giphy.com/username
//  www.giphy.com/gifs/title-1BcDe6GHIj1LMNOPqR
function processGiphy(img, url)
{
    let favicon = 'https://giphy.com/static/img/favicon.png';

    if (url.indexOf('giphy.com') > -1)
    {
        //  GIFs
        let matches = url.match(/giphy.com\/gifs\/([A-Za-z0-9\_-]+)$/)
        if (matches)
        {
            let trail = matches[1];

            let id = trail.substr(trail.lastIndexOf('-')+1);
            let thumb = 'https://media3.giphy.com/media/' + id + '/giphy.gif';
            setImgSrc(img, thumb, url);
            return true;
        }

        //  Profile
        matches = url.match(/giphy.com\/([A-Za-z0-9_-]+)$/);
        if (matches)
        {
            let user = matches[1];

            //  https://developers.giphy.com/docs/api/endpoint#search
            getRequest('https://api.giphy.com/v1/gifs/search?q=' + user + '&limit=1&api_key=' + giphyPublicBetaKey,
            (err, data) => {
                let parsedData = JSON.parse(data);

                let first = parsedData.data[0];
                if (first.user && first.user.avatar_url)
                {
                    let thumb = first.user.avatar_url;
                    setImgSrc(img, thumb, url);
                }
                else {
                    setImgSrc(img, favicon, url);
                }
            });
            return true;
        }

        setImgSrc(img, favicon, url);
        return true;
    }
    return false;
}

function processDeviantArt(img, url)
{
    //  oembed method
    let matches = url.match(/^.*(deviantart\.com\/[A-Za-z0-9_-]+\/(art\/[A-Za-z0-9_-]+|.*#\/\d*)|(fav\.me\/[A-Za-z0-9_-]+|sta\.sh\/[A-Za-z0-9_-]+))$/);
    if (matches)
    {   
        //  https://www.deviantart.com/developers/oembed#depths
        getRequest('https://backend.deviantart.com/oembed?url=' + url,
        (err, data) => {
            let parsedData = JSON.parse(data);
            let thumb = parsedData.thumbnail_url;
            setImgSrc(img, thumb, url);
        });
        return true;
    }

    //Deviantart domain
    if (url.match(/^.*deviantart\.com.*$/))
    {
        //  Userpage
        matches = url.match(/^.*deviantart\.com\/([A-Za-z0-9_-]+)$/)
        if (matches)
        {
            getRequest(url, (err, data) => {
                let thumb = trimStart(data, 'property="og:image" content="');
                setImgSrc(img, trimEnd(thumb), url);
            });
            return true;
        }

        //  favicon
        let thumb = 'https://st.deviantart.net/eclipse/icons/da_favicon_v2.ico';
        setImgSrc(img, thumb);
        return true;
    }

    return false;
}

function processNewgrounds(img, url)
{
    //Assume it's from profile
    if (url.indexOf('newgrounds.com') > -1)
    {
        //Check for Portal / Audio submission
        let matches = url.match(/\.newgrounds.com\/(portal\/view|audio\/listen)\/(\d+)$/);
        if (matches) {
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
            return true;
        }

        //Assume user profile page
        matches = url.match(/^.*[A-Za-z0-9-\_]\.newgrounds\.com.*$/);
        if (matches &&
            //Not general newgrounds domain
            url.indexOf('www.newgrounds.com') == -1) {  
            //  ... style="background-image: url('img-src')">View Profile</a> ...
            getRequest(url, (err, data) => {
                let m = data.match(/url\('(\/\/.*)'\)">View/);
                if (m) {
                    let thumb = 'https:' + m[1];
                    setImgSrc(img, thumb, url);
                }
            });
            return true;
        }

        //Fallback to favicon
        setImgSrc(img,'https://www.newgrounds.com/img/icons/favicon.png',url)
        return true;
    }
    return false;
}

function processPixiv(img, url)
{
    if (url.indexOf('.pixiv.net') > -1) {
        // ... id="meta-preload-data" ... ,"image":"img-src" ...
        getRequest(url, (err, data) => {
            let thumb = trimStart(data, 'id="meta-preload-data"');
            let target ='';
            //picture
            if (thumb.indexOf(target=',"thumb":"') > -1) {
                thumb = trimStart(thumb, target);
            }
            //profile
            else if (thumb.indexOf(target=',"image":"') > -1) {
                thumb = trimStart(thumb, target);
            }
            //favicon, trailing " to offset trim at end
            else {
                thumb = 'https://www.pixiv.net/favicon.ico"';
            }
            setImgSrc(img, trimEnd(thumb), url);
        });
        return true;
    }
    return false;
}

function processWiki(img, url)
{
    //Gamepedia
    if (url.indexOf('gamepedia.com/') > -1) {
        getRequest(url, (err, data) => {

            //favicon
            let thumb = trimEnd(url, 'gamepedia.com') + '/media/6/64/Favicon.ico';

            //title logo
            let target = 'meta property="og:image"';
            if ((data.indexOf(target) > -1)) {
                thumb = trimStart(data, target);
                thumb = trimStart(thumb, 'content="');
                thumb = trimEnd(thumb);
            }
            setImgSrc(img,thumb,url);
        });
        return true;
    }
    //Fandom
    else if (url.indexOf('fandom.com/') > -1) {
        if (url.indexOf('/wiki/') > -1) {
            getRequest(url, (err, data) => {

                //wiki favicon, trailing " for trim at end
                let target = url.replace(/(http:|https:|)\/\/(www.|m.)?([A-Za-z0-9.\_%-]*)\.fandom.*/, '$3');
                let thumb = 'https://vignette.wikia.nocookie.net/' + target + '/images/6/64/Favicon.ico"';

                //wiki logo
                if (data.indexOf(target='accesskey="z"') > -1) {
                    thumb = trimStart(data, target);
                    thumb = trimStart(thumb, 'src="');
                }
                setImgSrc(img, trimEnd(thumb), url);
            });
            return true;
        }
        //favicon
        setImgSrc(img, 'https://static.wikia.nocookie.net/qube-assets/f2/3958/favicons/favicon.ico', url);
        return true;
    }
    return false;
}

function processSteam(img, url)
{
    if (url.indexOf('steamcommunity.com') > -1 ||
        url.indexOf('steampowered.com') > -1) {
        getRequest(url, (err, data) => {

            let thumb = '', target = '';

            //Non-src urls
            if (data.indexOf(target='class="workshop_header"') > -1)
            {
                thumb = trimStart(data, target);
                thumb = trimStart(thumb, "background-image:url('");
                setImgSrc(img, trimEnd(thumb, "'"), url);
                return;
            }
            //preview image
            else if (data.indexOf(target='id="previewImageMain"') > -1) {
                thumb = trimStart(data, target);
                thumb = trimStart(thumb, 'src="');
                setImgSrc(img, trimEnd(thumb), url);
                return;
            }

            //class keyword
            let parsedData = data;
            while (parsedData.indexOf('class="') > -1) {
                thumb = trimStart(parsedData, 'class="');
                let matches = thumb.match(/^(game_header_image_full|grouppage_resp_logo|customBrowseLink|workshopItemPreviewImageMain|market_listing_iteminfo|subbox_left|guidePreviewImage|ActualMedia|playerAvatar)"/);
                if (matches && matches.length > 1) {
                    thumb = trimStart(thumb, 'src="');
                    setImgSrc(img, trimEnd(thumb), url);
                    return;
                }
                parsedData = trimStart(thumb, '"');
            }
            //sharefiles video & news
            if (data.indexOf('rel="image_src"') > -1)
            {
                let thumb = trimStart(data, 'rel="image_src"');
                    thumb = trimStart(thumb, 'href="');
                    thumb = trimEnd(thumb);
                setImgSrc(img, thumb, url);
                return;
            }
            //favicon
            setImgSrc(img, 'https://steamcommunity.com/favicon.ico', url);
        });
        return true;
    }
    return false;
}

function processOsu(img,url)
{
    if (url.indexOf('osu.ppy.sh') > -1)
    {
        getRequest(url, (err, data) => {
            let thumb = '', target = '';
            //user
            if ((url.indexOf('/users/') > -1) &&
                (data.indexOf(target='"user":{"avatar_url":"') > -1)) {
                thumb = trimStart(data, target);
                thumb = decodeEscapedChars(trimEnd(thumb));
            }
            //beatmapsets
            else if (url.indexOf(target='/beatmapsets/') >-1) {
                thumb = trimStart(url,target);
                thumb = trimEnd(thumb,'#osu');
                thumb = 'https://assets.ppy.sh/beatmaps/' + thumb + '/covers/cover.jpg';
            }
            //artist
            else if (data.indexOf(target='.artist__portrait {') > -1)
            {
                thumb = trimStart(data, target);
                thumb = trimStart(thumb, "background-image: url('");
                thumb = trimEnd(thumb, "'");
            }
            //favicon
            else {
                thumb = 'https://osu.ppy.sh/apple-touch-icon.png';
            }
            setImgSrc(img, thumb, url);
        });
        return true;
    }
    return false;
}

function processReddit(img,url) {
    if (url.indexOf('reddit.com') > -1)
    {
        if (url.endsWith('.com')) {
            thumb = 'https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-120x120.png';
            setImgSrc(img,thumb,url);
            return true;
        }
        getRequest(url, (err, data) => {
            
            let thumb = '', target = '';

            //community icon
            if (data.indexOf(target='--newCommunityTheme-banner-iconImage: url("') > -1) {
                thumb = trimStart(data, target);
                thumb = trimEnd(thumb);
            }
            //account icon
            else if (data.indexOf(target='"accountIcon":"') > -1) {
                thumb = trimStart(data, target);
                thumb = trimEnd(thumb);
                thumb = JSON.parse('"' + thumb + '"');
            }
            //image
            else if (data.indexOf(target='"thumbnail":{"url":"') > -1) {
                thumb = trimStart(data, target);
                thumb = trimEnd(thumb);
            }
            //page
            else if (data.indexOf(target='class="iconImage: url("') > -1) {
                thumb = trimStart(data, target);
                thumb = trimEnd(thumb);
            }

            //favicon, self correction if wrongly received
            if (thumb == '' || thumb == 'self') {
                thumb = 'https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-120x120.png';
            }
            //Set thumb
            setImgSrc(img, thumb, url);
        });
        return true;
    }
    return false;
}

function processTumblr(img, url)
{
    if (url.indexOf('.tumblr.com') > -1)
    {
        getRequest(url, (err, data) => {
            let thumb = '', target = '';

            //post
            if ((url.indexOf('/post/') > -1) &&
                (data.indexOf(target='property="og:image:secure_url"') > -1)) {
                thumb = trimStart(data, target);
                thumb = trimStart(thumb, 'content="');
            }
            //avatar
            else if (data.indexOf(target='class="avatar-circle"') > -1) {
                thumb = trimStart(data, target);
                thumb = trimStart(thumb, 'src="');
            }
            //favicon, trailing " to offset trim
            else {
                thumb = 'https://assets.tumblr.com/images/favicons/favicon.ico"';
            }

            setImgSrc(img, trimEnd(thumb), url);
        });
        return true;
    }
    return false;
}

function processTwitter(img, url)
{
    //https://abs.twimg.com/favicons/twitter.ico
}

//Process url to populate desired thumbnail
function parseUrl (img, url)
{
    if (url == '')  return;     //Skip processing empty url

    while (url.endsWith('/'))   //Trim backslash
        url = url.slice(0,-1);

    //If url was cached, pull a cached image-url
    if (thumbDB.hasOwnProperty(url))
    {
        let srcUrl = thumbDB[url];      //Reuse &
        setImgSrc_Only(img, srcUrl);    //Recycle
        return;
    }
    // console.log('parseUrl process', url);

    //Process unrecognized url
    //  leave if operation is done or delegated
    let i = 0;
    let callback = null;
    while(1)
    {
        switch(i)
        {
            case 0: callback = processYoutubeVimeo; break;
            case 1: callback = processFacebook;     break;
            case 2: callback = processInsta;        break;
            case 3: callback = processGiphy;        break;
            case 4: callback = processDeviantArt;   break;
            case 5: callback = processNewgrounds;   break;
            case 6: callback = processPixiv;        break;
            case 7: callback = processSteam;        break;
            case 8: callback = processOsu;          break;
            case 9: callback = processWiki;         break;
            case 10:callback = processReddit;       break;
            case 11:callback = processTumblr;       break;
            default:    return;
        }
        if (callback(img,url))  return;
        ++i;
    }
}

//Main update loop
function adaptBookmarkThumbnails()
{
    //Fetch a list of bookmark cardviews
    let view = document.querySelectorAll('.addbookmark-cardwrapper .upper-half');

    //For each of those elements
    view.forEach(el => {
        //Get its UrlInputFields
        let urlField = el.querySelector('.title-and-address .fieldset .UrlField input[placeholder="Address"]');

        //Bookmark address field is mandatory
        if (urlField == null)   return;

        //Get its PreviewImage
        var img = el.querySelector('.preview .thumbnail-image img');

        //Image doesn't exist? Let's assume that it's a default SVG element then
        if (img == null)
            img = el.querySelector('.preview .thumbnail-image svg');

        //If both address and "img" is present, let's begin
        if (img != null)
        {
            var url = urlField.value;   //Url from Boomark address field
            while (url.endsWith('/'))   //trim backslash for standardization
                url = url.slice(0, -1);

            let fieldPath = dompath(urlField);  //Get DOM path

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
var bookmarkThumbnailAdapter = setInterval(adaptBookmarkThumbnails, tickRate); 
```