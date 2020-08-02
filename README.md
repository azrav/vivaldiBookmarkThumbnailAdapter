# Vivaldi Bookmark Thumbnail Adapter
A workaround mod aimed to adapt bookmark thumbnails according to their URLs.

Here's hoping that this mod becomes obsolete. (When thumbnails gets better support)

## Why?
To satisfy my OCD.

Initial intention is to cater thumbnail displays for youtube.
1. Bookmarking videos while you're traversing a playlist (say, your "Likes" to find notable videos you've liked) tend to generate inaccurate thumbnails.
2. Refreshing bookmark thumbnails leaves you with a start-of-video black screen which can be undesirable.
3. Manually setting custom thumbnails for bulks of youtube bookmark isn't scaleable (takes up space on computer, and your effort/time)

After some thought, I realize I could perhaps extend this to cover more Platforms / APIs other than Youtube.

---

## Installation
Follow the instructions at https://forum.vivaldi.net/topic/10549/modding-vivaldi

### Configuring
In bookmarkThumbnailAdjustment.js,
You can increase the rate of update by lowering the 1000 (milliseconds) in
```
var bookmarkThumbnailHijackerUpdateLoop = setInterval(hijackBookmarkThumbnail, 1000); 
```

In bookmarkThumbnailAdjustment.css,
You can tweak its `object-fit` to `cover`, `contain`, `fill`.
Refer to https://www.w3schools.com/csS/css3_object-fit.asp to see what each style does.

## Currently Supports
### Youtube
`https://www.youtube.com/watch?v=`**videoID**
Some videos doesn't have thumbnails and will display Youtube's fallback thumbnail.

## Things I hope to support
No guarantees.
- DeviantArt
- Instagram
- Giphy
- Pixiv

## Credits to
- LomN *for inspiration and moddng reference*
- Vivaldi modding community