## Vivaldi Bookmark Thumbnail Adapter

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

**References**

- [StackOverflow - Get DOM Path](https://stackoverflow.com/questions/12644147/getting-element-path-for-selector#answer-22072325)
- [deponeWD video](https://github.com/deponeWD/video)
- [Youtube Data API v3](https://developers.google.com/youtube/v3/docs/playlists/list)
- [DeviantArt API, oembed specs](https://www.deviantart.com/developers/oembed#depths)
- [GIPHY API Profile: Make Your Project More Fun with GIFs](https://rapidapi.com/blog/giphy-api-profile-make-your-project-more-fun-with-gifs/)
- [GIPHY API Endpoints](https://developers.giphy.com/docs/api/endpoint#search)
- [Instagram fb Dev page](https://developers.facebook.com/docs/instagram)
- [Newgrounds.io](https://www.newgrounds.io)

**Credits**

* deponeWD (support for various types of youtube & vimeo urls)
* sshow & jcern (for the DOM path function)
* LomN (for the inspiration and moddng references)
* Stackoverflow and Vivaldi modding communities

**Important Warning for Tinkerers**
If you intend on editing the `Bookmarks` checksum etc... please remember to backup your `Bookmarks`, `file_mapping.json` and `VivaldiThumbnails` folder before doing so.

I've had my speed dials / bookmark thumbnails reset on a couple of occasion trying to satisfy my OCD, and I think? it's best left untouched.

* * *

**Installation**  
Follow the instructions at [https://forum.vivaldi.net/topic/10549/modding-vivaldi](https://forum.vivaldi.net/topic/10549/modding-vivaldi)
