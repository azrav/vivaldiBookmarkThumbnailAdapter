## Vivaldi Bookmark Thumbnail Adapter
*Edited title. Initially called "Bookmark Thumbnail Hijacking - Workaround"*

A workaround mod aimed to adapt bookmark thumbnails according to their URLs.
Here's hoping that this mod becomes obsolete *to me*. (When thumbnails gets better support)

![QueGER0KgW.gif](https://forum.vivaldi.net/assets/uploads/files/1596378734615-queger0kgw.gif) 

#### Why?
The Initial intention was to cater thumbnail displays for youtube.
1. Bookmarking videos while you're traversing a playlist (say, your "Likes" to find notable videos you've liked) tend to generate inaccurate thumbnails.
2. Refreshing bookmark thumbnails leaves you with a start-of-video black screen which can be undesirable.
3. Manually setting custom thumbnails for bulks of youtube bookmark isn't scaleable (takes up space on computer, and your effort/time)

After some thought, I realize I could extend this to cover more Platforms / APIs other than Youtube.
I'm doing this for learning and hobby too.

---

#### Latest changes
**Optimizations**
1. Cache and reuse thumbnails, with trimmed Bookmark-url as key. Reduce no. of JSON requests to make.
2. Doesn't process needlessly when address field's text are the same. Also handled for multiple bookmark elements present.
3. Experimental: Support for Youtube API Key. (Used to retrieve thumbs for channel / playlist)

#### Installation
Follow the instructions at https://forum.vivaldi.net/topic/10549/modding-vivaldi

#### Configuring
In `bookmarkThumbnailAdjustment.js`,
You can increase the rate of update by lowering the 1000 (milliseconds) in
```
var bookmarkThumbnailAdapter = setInterval(adaptBookmarkThumbnails, 1000);
```

Under the processDeviantArt function, you can reorder the image-type you prefer.
It'll attempt to grab the first available image-url it encounters.
```
testImage(url, userUrl+'.gif', success, ()=> {
	testImage(url, userUrl+'.png', success, ()=> {
		testImage(url, userUrl+'.jpg', success, ()=> {
			//unhandled case, exhausted all known types
		});
	});
});
```

In `bookmarkThumbnailAdjustment.css`,
I've set `object-fit` to use `contain`, but you could change it `cover` or `fill` if it better fits your need.

### Currently Supports
- Youtube (videos only; channel and playlist thumbnails requires API Key)
- Vimeo
- Instagram (posts only)
- GIPHY (gifs & profile)
- deviantArt (profile page, with `oembed` fallbacks.)
- Newgrounds (`portal/view` & `audio/listen` submissions only)

Going to iron out the edge cases over time *if I can*.

---

#### References
- [StackOverflow - Get DOM Path](https://stackoverflow.com/questions/12644147/getting-element-path-for-selector#answer-22072325)
- [deponeWD video](https://github.com/deponeWD/video)
- [Youtube Data API v3](https://developers.google.com/youtube/v3/docs/playlists/list)
- [DeviantArt API, oembed specs](https://www.deviantart.com/developers/oembed#depths)
- [GIPHY API Profile: Make Your Project More Fun with GIFs](https://rapidapi.com/blog/giphy-api-profile-make-your-project-more-fun-with-gifs/)
- [GIPHY API Endpoints](https://developers.giphy.com/docs/api/endpoint#search)
- [Instagram fb Dev page](https://developers.facebook.com/docs/instagram)
- [Newgrounds.io](https://www.newgrounds.io)

#### Credits
- deponeWD (support for various types of youtube & vimeo urls)
- sshow & jcern (for the DOM path function)
- LomN (for the inspiration and moddng references)
- Vivaldi modding community

#### Other Notes
The older versions and references I used are on this [Github page](https://github.com/azrav/vivaldiBookmarkThumbnailAdapter/commits/master)
