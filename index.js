///////////////////////////////////
//
//  Name: FlipBook
//  Version: 1.0.0
//  Author: Taufiq El Rahman
//
///////////////////////////////////

(function () {
  (function (factory) {
    window.FlipBook = factory();
  })(function () {
    'use strict';
    const Modernizr = window.Modernizr || { csstransforms3d: true };
    if (typeof Modernizr.preserve3d !== 'boolean') {
      Modernizr.preserve3d = true;
    }

    function FlipBook(el, options) {
      // Allow developer to omit new when instantiating
      // if (!(this instanceof FlipBook)) {
      //   if (el.length) {
      //     Array.prototype.forEach.call(el, function(n) {
      //       return new FlipBook(n, options);
      //     });
      //   } else {
      //     return new FlipBook(el, options);
      //   }
      // }

      // OPTIONS
      const defaults = {
        nextButton: document.getElementById(''),
        previousButton: document.getElementById(''),
        // hasSpreads: false,
        canClose: false,
        arrowKeys: true,
        // concurrentAnimations: null,
        // limitPageTurns: true,
        initialActivePage: 0,
        onPageTurn: function () {},
        // onSpreadSetup: function () {},
        initialCall: false,
        width: '800px',
        height: '283px',
      };
      this.options = { ...defaults, ...options };
      this.classNames = {
        page: 'c-flipbook__page',
        hiddenCover: 'c-flipbook__hidden_cover',
        atFrontCover: 'at-front-cover',
        atBackCover: 'at-rear-cover',
        firstPage: 'first-page',
        lastPage: 'last-page',
        isReady: 'is-ready',
        isActive: 'is-active',
        isCalling: 'is-calling',
        isAnimating: 'is-animating',
        wasActive: 'was-active',
      };

      // PRIVATE const
      this.el = document.getElementById(el);
      this.el.style.width = this.options.width;
      this.el.style.height = this.options.height;
      this.el.setAttribute('data-useragent', navigator.userAgent); // Add user agent attribute to HTMLElement - used in CSS selection ( for IE10 detection )
      this.pages = this.el.querySelectorAll(`.${this.classNames.page}, .${this.classNames.hiddenCover}`);
      if (this.options.canClose) {
        if (this.options.initialActivePage === 0) this.el.classList.add(this.classNames.atFrontCover);
        this.pages.item(0).classList.add(this.classNames.firstPage);
        this.pages.item(this.pages.length - 1).classList.add(this.classNames.lastPage);
      }
      // RUN
      this.init();
    }

    FlipBook.prototype.getPages = function () {
      this.pages = this.el.querySelectorAll(`.${this.classNames.page}, .${this.classNames.hiddenCover}`);
      return Array.from(this.pages);
    };

    FlipBook.prototype.init = function () {
      const el = this.el;
      const els = {};
      const options = this.options;

      el.classList.add(this.classNames.isReady);

      // if (options.hasSpreads) this.setupSpreads();

      const leftFunction = options.canClose ? 'even' : 'odd';
      const rightFunction = options.canClose ? 'odd' : 'even';
      els.pagesLeft = el.querySelectorAll(`.${this.classNames.page}:nth-child(${leftFunction})`);
      els.pagesRight = el.querySelectorAll(`.${this.classNames.page}:nth-child(${rightFunction})`);

      // if initialActivePage is odd, we substract one.
      const initialActivePage =
        options.initialActivePage & 1 ? options.initialActivePage - 1 : options.initialActivePage;

      if (!options.canClose) {
        const coverEl = document.createElement('div');
        coverEl.classList.add(this.classNames.hiddenCover);
        el.prepend(coverEl.cloneNode());
        el.append(coverEl.cloneNode());

        Array.from(this.pages).forEach((page, index) => {
          if (index === initialActivePage || index === initialActivePage + 1) {
            page.classList.add(this.classNames.isActive);
          }
        });
      } else {
        if (options.initialActivePage !== 0) {
          Array.from(this.pages).forEach((page, index) => {
            if (index === initialActivePage || index === initialActivePage + 1) {
              page.classList.add(this.classNames.isActive);
            }
          });
        } else {
          this.pages.item(0).classList.add(this.classNames.isActive);
        }
      }

      let initInterval;
      if (options.initialCall) {
        const setupCalls = () => {
          els.pagesRight.item(0).classList.add(this.classNames.isCalling);
          setTimeout(() => {
            els.pagesRight.item(0).classList.remove(this.classNames.isCalling);
          }, 900);
        };

        setTimeout(setupCalls, 500);
        initInterval = setInterval(setupCalls, 3000);
      }

      els.previousTrigger = [...Array.from(els.pagesLeft), options.previousButton];
      els.nextTrigger = [...Array.from(els.pagesRight), options.nextButton];

      els.previousTrigger.forEach((el) => {
        if (!el) return;
        el.addEventListener(
          'click',
          function () {
            this.turnPage('back');
          }.bind(this),
        );
      });

      els.nextTrigger.forEach((el) => {
        if (!el) return;
        el.addEventListener(
          'click',
          function () {
            this.turnPage('forward');
            if (options.initialCall) clearInterval(initInterval);
          }.bind(this),
        );
      });

      // if (typeof Hammer !== 'undefined') {
      //   const opts = {
      //     drag_min_distance: 5,
      //     swipe_velocity: 0.3,
      //   };

      //   const hammerLeft = new Hammer(document.querySelector('.FlipBook-Page:nth-child(2n)'), opts);
      //   hammerLeft.on(
      //     'swiperight',
      //     function(evt) {
      //       this.turnPage('back');
      //       // evt.gesture.stopDetect();
      //       evt.preventDefault();
      //     }.bind(this),
      //   );

      //   const hammerRight = new Hammer(document.querySelector('.FlipBook-Page:nth-child(odd)'), opts);
      //   hammerRight.on(
      //     'swipeleft',
      //     function(evt) {
      //       this.turnPage('forward');
      //       // evt.gesture.stopDetect();
      //       evt.preventDefault();
      //     }.bind(this),
      //   );
      // }

      let forwardKeycode = 37;
      let backKeycode = 39;

      if (!Modernizr.csstransforms3d) {
        forwardKeycode = 39;
        backKeycode = 37;
      }

      if (options.arrowKeys) {
        document.addEventListener(
          'keydown',
          function (e) {
            if (e.keyCode == forwardKeycode) {
              this.turnPage('forward');
              if (options.initialCall) clearInterval(initInterval);
              return false;
            }
            if (e.keyCode == backKeycode) {
              this.turnPage('back');
              return false;
            }
          }.bind(this),
        );
      }
    };

    FlipBook.prototype.isLastPage = function () {
      const index = {};
      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains(this.classNames.isActive)) {
          activePages.push(index);
        }
      });
      index.activeLeft = activePages[0]; // Note about fix: the double spread code above caused code to wrap to bottom of array . This is the fix for double spreads.
      return this.pages.last().index() == index.activeLeft;
    };

    FlipBook.prototype.isFirstPage = function () {
      const index = {};
      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains(this.classNames.isActive)) {
          activePages.push(index);
        }
      });
      index.activeRight = activePages[0];
      return this.pages.first().index() == index.activeRight;
    };

    FlipBook.prototype.turnPage = function (arg) {
      // debugger;
      const el = this.el;
      const els = {};
      const options = this.options;
      const index = {};
      let direction = arg;

      els.pagesActive = el.querySelectorAll(`.${this.classNames.page}.${this.classNames.isActive}`);
      els.pagesAnimating = el.querySelectorAll(`.${this.classNames.page}.${this.classNames.isAnimating}`);
      els.children = el.querySelectorAll(`.${this.classNames.page}, .${this.classNames.hiddenCover}`);

      // const maxAnimations = options.concurrentAnimations && els.pagesAnimating.length > options.concurrentAnimations;
      const maxAnimationsBrowser = !Modernizr.preserve3d && els.pagesAnimating.length > 2;

      if (maxAnimationsBrowser) {
        return;
      }

      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains(this.classNames.isActive)) {
          activePages.push(index);
        }
      });

      // if (options.hasSpreads) {
      //   index.activeRight = activePages[1];
      //   index.activeLeft = index.activeRight - 1;
      // } else {
      // Single page spreads
      index.activeLeft = activePages[0]; // Note about fix: the double spread code above caused code to wrap to bottom of array . This is the fix for double spreads.
      index.activeRight = index.activeLeft + 1;
      // }

      const isFirstPage = index.activeLeft === (options.canClose ? 0 : 1) && direction == 'back';
      const isLastPage =
        index.activeRight === (options.canClose ? this.pages.length - 1 : this.pages.length - 2) &&
        direction == 'forward';

      if (isFirstPage || isLastPage) {
        return;
      }

      if (typeof arg == 'number') {
        const isOdd = arg & 1;
        const isRight = options.canClose ? isOdd : !isOdd;

        index.targetRight = isRight ? arg : arg + 1;
        index.targetLeft = index.targetRight - 1;

        if (index.targetLeft == index.activeLeft) {
          return;
        } else if (index.targetLeft > index.activeRight) {
          direction = 'forward';
          index.target = index.targetLeft;
          index.targetSibling = index.target + 1;
        } else {
          direction = 'back';
          index.target = index.targetRight;
          index.targetSibling = index.target - 1;
        }

        // if (!options.hasSpreads) {
        index.target = index.target - 1;
        index.targetSibling = index.targetSibling - 1;
        // }
      } else {
        index.target = direction == 'forward' ? index.activeRight + 1 : index.activeLeft - 1;
        index.targetSibling = direction == 'forward' ? index.activeRight + 2 : index.activeLeft - 2;
      }

      if (direction == 'forward' && index.target == 2) {
        index.target = 1;
        index.targetSibling = 2;
      }

      els.pagesAnimatingOut = direction == 'back' ? els.pagesActive.item(0) : els.pagesActive.item(1);
      els.pagesAnimatingIn = els.children.item(index.target);
      els.pagesTarget = [els.pagesAnimatingIn];
      if (index.targetSibling !== -1) els.pagesTarget = [...els.pagesTarget, els.children.item(index.targetSibling)];
      els.pagesAnimating = [els.pagesAnimatingIn, els.pagesAnimatingOut];

      els.pagesActive.forEach((page) => {
        page.classList.remove(this.classNames.isActive);
        page.classList.add(this.classNames.wasActive);
      });
      els.pagesTarget.forEach((page) => {
        if (!page) return;
        page.classList.add(this.classNames.isActive);
      });

      if (Modernizr.csstransforms3d) {
        els.pagesAnimating.forEach((page) => {
          if (!page) return;
          page.classList.add(this.classNames.isAnimating);
        });
      }

      els.pagesAnimating.forEach((page) => {
        if (!page) return;
        ['webkitTransitionEnd', 'oTransitionEnd', 'msTransitionEnd', 'transitionend'].forEach((trans) => {
          page.addEventListener(
            trans,
            function () {
              els.pagesAnimating.forEach((page) => {
                if (!page) return;
                page.classList.remove(this.classNames.isAnimating);
              });

              els.pagesActive.forEach((page) => {
                page.classList.remove(this.classNames.wasActive);
              });
            }.bind(document),
          );
        });
      });

      options.onPageTurn(el, els);
      // options.onPageTurn(this.isFirstPage(), this.isLastPage());
      // el.dispatchEvent(event);
      // $(this).trigger('pageTurn.FlipBook', [el, els]);

      if (direction == 'forward' && els.pagesTarget[0].classList.contains(this.classNames.lastPage)) {
        el.classList.remove(this.classNames.atFrontCover);
        el.classList.add(this.classNames.atBackCover);
      } else if (
        direction == 'back' &&
        els.pagesTarget[els.pagesTarget.length - 1].classList.contains(this.classNames.firstPage)
      ) {
        el.classList.remove(this.classNames.atBackCover);
        el.classList.add(this.classNames.atFrontCover);
      } else {
        el.classList.remove(this.classNames.atBackCover);
        el.classList.remove(this.classNames.atFrontCover);
      }
    };

    // FlipBook.prototype.setupSpreads = function () {
    //   const el = this.el;
    //   const options = this.options;
    //   this.el.querySelectorAll('.FlipBook-Spread').forEach((page) => {
    //     const pageEl = document.createElement('div');
    //     pageEl.classList.add('FlipBook-Page with-Spread');
    //     pageEl.innerHTML = '';
    //     pageEl.appendChild(page.cloneNode());

    //     page.after(pageEl);
    //     page.replaceWith(pageEl.cloneNode());
    //     // page.parentNode.replaceChild(pageEl.cloneNode());
    //   });

    //   options.onSpreadSetup(el);
    //   // $(this).trigger('spreadSetup.FlipBook', el);
    // };
    return FlipBook;
  });
})();
