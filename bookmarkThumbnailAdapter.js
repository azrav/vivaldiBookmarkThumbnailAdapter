/* Bookmark Preview Hijack */

const regexYoutubeWatch = /^.*youtube\.com\/watch\?v=([A-Za-z0-9_]+).*?$/g;

function hijackBookmarkThumbnail() {
    //Get list of bookmark cardviews
    let view = document.querySelectorAll('.addbookmark-cardwrapper .upper-half');

    //For each of those elements
    view.forEach(el => {
        //Fetch a list of its UrlInputFields & PreviewImages
        let urlField = el.querySelector('.title-and-address .fieldset .UrlField input[placeholder="Address"]');
        let img = el.querySelector('.preview .thumbnail-image img');

        //If both address and preview image elements are present
        if (urlField != null && img != null)
        {
            let url = urlField.value;

            //Replace youtube video ID if matched
            const ytVidID = url.replace(regexYoutubeWatch, '$1');

            //If replace is successful, set youtube video thumbnail using ID
            if (url != ytVidID)
                img.src = "https://img.youtube.com/vi/" + ytVidID + "/maxresdefault.jpg";
        }
    });
}

var bookmarkThumbnailHijackerLoop = setInterval(hijackBookmarkThumbnail, 1000); 