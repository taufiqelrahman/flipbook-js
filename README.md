# FlipBook - Lightweight Non-JQuery Plugin

FlipBook is a plugin built on javascript which allows users animate to a book with flippable pages.
This plugin doesn't depend on any other libraries and this doesn't use JQuery.
This would cut a significant download time as this is built 100% using plain vanilla javascript.

<a href="https://demo-FlipBook.taufiqelrahman.com/" target="_blank"><strong>Demo and documentation</strong></a>

## Features

* Lightweight, no additional javascript dependency.
* Easy installation.
* Can make the pages call for attention.
* Easy navigation with arrow keys.
* Can jump to specific page.

## Browser Compatibility

Currently tested in:

* Chrome Version 76.0.3809.132
* Firefox Version 69.0.1
* Safari Version 12.1.1
* Opera Version 63.0.3368.94

## Getting Started

Include stylesheet in head tag:
```
<link rel="stylesheet" href="FlipBook.css">
```

and script in body tag:
```
<script src="FlipBook.js"></script>
```

Create your book skeleton like this:
```
<div class="c-flipbook" id="FlipBook">
  <div class="c-flipbook__page">
  </div>
  <div class="c-flipbook__page">
  </div>
  ...
  <div class="c-flipbook__page">
  </div>
</div>
```

Add 1 line of javascript to initialize:
```
<script>
  new FlipBook('element-id');
</script>
```

## Options

```
<script>
  new FlipBook('element-id', { // ID of element
    nextButton: document.getElementById(''), // next button element
    previousButton: document.getElementById(''), // previous button element
    canClose: false, // book can close on its cover
    arrowKeys: true, // can be navigated with arrow keys
    initialActivePage: 0, // index of initial page that is opened
    onPageTurn: function () {}, // callback after page is turned
    initialCall: false, // should the book page calls for attention
    width: '800px', // define width
    height: '300px', // define height
  });
</script>
```
