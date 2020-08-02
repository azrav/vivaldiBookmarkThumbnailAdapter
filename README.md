### Vivaldi Bookmark Thumbnail Adapter
*Edited title. Initially called "Bookmark Thumbnail Hijacking - Workaround"*

A workaround mod aimed to adapt bookmark thumbnails according to their URLs.
Here's hoping that this mod becomes obsolete. (When thumbnails gets better support)

#### Why?
Initial intention is to cater thumbnail displays for youtube.
1. Bookmarking videos while you're traversing a playlist (say, your "Likes" to find notable videos you've liked) tend to generate inaccurate thumbnails.
2. Refreshing bookmark thumbnails leaves you with a start-of-video black screen which can be undesirable.
3. Manually setting custom thumbnails for bulks of youtube bookmark isn't scaleable (takes up space on computer, and your effort/time)

After some thought, I realize I could extend this to cover more Platforms / APIs other than Youtube.

---

#### Installation
Follow the instructions at https://forum.vivaldi.net/topic/10549/modding-vivaldi

#### Configuring
In bookmarkThumbnailAdjustment.js,
You can increase the rate of update by lowering the 1000 (milliseconds) in
```
var bookmarkThumbnailHijackerUpdateLoop = setInterval(hijackBookmarkThumbnail, 1000); 
```

In bookmarkThumbnailAdjustment.css,
You can tweak its `object-fit` to `cover`, `contain`, `fill`.
Refer to https://www.w3schools.com/csS/css3_object-fit.asp to see what each style does.

### Currently Supports
- Youtube (videos only; fallback to youtube's default if unavailable)
- Vimeo
- Instagram (posts only)
- deviantArt (profile page, with `oembed` fallbacks.)
- Newgrounds (`portal/view` & `audio/listen` submissions only)

For now, I'll be avoiding sites that requires authorizations. Generally struggling with fetching user avatars. There's bound to be bugs. Going to iron out the edge cases that I can over time.

### Help needed
1. Instead of updating by interval, can it be optimized to only update upon  
    user interaction with said bookmark manager/sidebar?
2. Report edge-cases or bugs, or share your fixes for them.
3. Share ideas for other APIs that you think this could be used for.

#### References
- [deponeWD video](https://github.com/deponeWD/video)
- [DeviantArt API, oembed specs](https://www.deviantart.com/developers/oembed#depths)
- [GIPHY API Profile: Make Your Project More Fun with GIFs](https://rapidapi.com/blog/giphy-api-profile-make-your-project-more-fun-with-gifs/)
- [GIPHY API Endpoints](https://developers.giphy.com/docs/api/endpoint#search)
- [Newgrounds.io](https://www.newgrounds.io)
- [Instagram fb Dev page](https://developers.facebook.com/docs/instagram)

#### Credits
- deponeWD (support for multiple variations of youtube & vimeo)
- LomN *for inspiration and moddng reference*
- Vivaldi modding community