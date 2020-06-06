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

    function Heidelberg(el, options) {
      // Allow developer to omit new when instantiating
      // if (!(this instanceof Heidelberg)) {
      //   if (el.length) {
      //     Array.prototype.forEach.call(el, function(n) {
      //       return new Heidelberg(n, options);
      //     });
      //   } else {
      //     return new Heidelberg(el, options);
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

      // PRIVATE constIABLES
      // Main element always a jQuery object
      this.el = document.getElementById(el);
      this.el.style.width = this.options.width;
      this.el.style.height = this.options.height;
      this.el.setAttribute('data-useragent', navigator.userAgent); // Add user agent attribute to HTMLElement - used in CSS selection ( for IE10 detection )
      this.pages = this.el.querySelectorAll('.Heidelberg-Page, .Heidelberg-HiddenCover');
      if (this.options.canClose) {
        if (this.options.initialActivePage === 0) this.el.classList.add('at-front-cover');
        this.pages.item(0).classList.add('first-page');
        this.pages.item(this.pages.length - 1).classList.add('last-page');
      }
      // this.pagesArr = Array.from(this.pages);
      // RUN
      this.init();
    }

    Heidelberg.prototype.getPages = function () {
      this.pages = this.el.querySelectorAll('.Heidelberg-Page, .Heidelberg-HiddenCover');
      return Array.from(this.pages);
    };

    Heidelberg.prototype.init = function () {
      const el = this.el;
      const els = {};
      const options = this.options;

      el.classList.add('is-ready');

      // if (options.hasSpreads) this.setupSpreads();

      const leftFunction = options.canClose ? 'even' : 'odd';
      const rightFunction = options.canClose ? 'odd' : 'even';
      els.pagesLeft = el.querySelectorAll(`.Heidelberg-Page:nth-child(${leftFunction})`);
      els.pagesRight = el.querySelectorAll(`.Heidelberg-Page:nth-child(${rightFunction})`);

      // if initialActivePage is odd, we substract one.
      const initialActivePage =
        options.initialActivePage & 1 ? options.initialActivePage - 1 : options.initialActivePage;

      if (!options.canClose) {
        const coverEl = document.createElement('div');
        coverEl.classList.add('Heidelberg-HiddenCover');
        el.prepend(coverEl.cloneNode());
        el.append(coverEl.cloneNode());

        Array.from(this.pages).forEach((page, index) => {
          if (index === initialActivePage || index === initialActivePage + 1) {
            page.classList.add('is-active');
          }
        });
      } else {
        if (options.initialActivePage !== 0) {
          Array.from(this.pages).forEach((page, index) => {
            if (index === initialActivePage || index === initialActivePage + 1) {
              page.classList.add('is-active');
            }
          });
        } else {
          this.pages.item(0).classList.add('is-active');
        }
      }

      let initInterval;
      if (options.initialCall) {
        const setupCalls = () => {
          els.pagesRight.item(0).classList.add('is-calling');
          setTimeout(() => {
            els.pagesRight.item(0).classList.remove('is-calling');
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
            this.turnPage('forwards');
            if (options.initialCall) clearInterval(initInterval);
          }.bind(this),
        );
      });

      // if (typeof Hammer !== 'undefined') {
      //   const opts = {
      //     drag_min_distance: 5,
      //     swipe_velocity: 0.3,
      //   };

      //   const hammerLeft = new Hammer(document.querySelector('.Heidelberg-Page:nth-child(2n)'), opts);
      //   hammerLeft.on(
      //     'swiperight',
      //     function(evt) {
      //       this.turnPage('back');
      //       // evt.gesture.stopDetect();
      //       evt.preventDefault();
      //     }.bind(this),
      //   );

      //   const hammerRight = new Hammer(document.querySelector('.Heidelberg-Page:nth-child(odd)'), opts);
      //   hammerRight.on(
      //     'swipeleft',
      //     function(evt) {
      //       this.turnPage('forwards');
      //       // evt.gesture.stopDetect();
      //       evt.preventDefault();
      //     }.bind(this),
      //   );
      // }

      let forwardsKeycode = 37;
      let backKeycode = 39;

      if (!Modernizr.csstransforms3d) {
        forwardsKeycode = 39;
        backKeycode = 37;
      }

      if (options.arrowKeys) {
        document.addEventListener(
          'keydown',
          function (e) {
            if (e.keyCode == forwardsKeycode) {
              this.turnPage('forwards');
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

    Heidelberg.prototype.isLastPage = function () {
      const index = {};
      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains('is-active')) {
          activePages.push(index);
        }
      });
      index.activeLeft = activePages[0]; // Note about fix: the double spread code above caused code to wrap to bottom of array . This is the fix for double spreads.
      return this.pages.last().index() == index.activeLeft;
    };

    Heidelberg.prototype.isFirstPage = function () {
      const index = {};
      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains('is-active')) {
          activePages.push(index);
        }
      });
      index.activeRight = activePages[0];
      return this.pages.first().index() == index.activeRight;
    };

    Heidelberg.prototype.turnPage = function (arg) {
      // debugger;
      const el = this.el;
      const els = {};
      const options = this.options;
      const index = {};
      let direction = arg;

      els.pagesActive = el.querySelectorAll('.Heidelberg-Page.is-active');
      els.pagesAnimating = el.querySelectorAll('.Heidelberg-Page.is-animating');
      els.children = el.querySelectorAll('.Heidelberg-Page, .Heidelberg-HiddenCover');

      // const maxAnimations = options.concurrentAnimations && els.pagesAnimating.length > options.concurrentAnimations;
      const maxAnimationsBrowser = !Modernizr.preserve3d && els.pagesAnimating.length > 2;

      if (maxAnimationsBrowser) {
        return;
      }

      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains('is-active')) {
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
        direction == 'forwards';

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
          direction = 'forwards';
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
        index.target = direction == 'forwards' ? index.activeRight + 1 : index.activeLeft - 1;
        index.targetSibling = direction == 'forwards' ? index.activeRight + 2 : index.activeLeft - 2;
      }

      if (direction == 'forwards' && index.target == 2) {
        index.target = 1;
        index.targetSibling = 2;
      }

      els.pagesAnimatingOut = direction == 'back' ? els.pagesActive.item(0) : els.pagesActive.item(1);
      els.pagesAnimatingIn = els.children.item(index.target);
      els.pagesTarget = [els.pagesAnimatingIn];
      if (index.targetSibling !== -1) els.pagesTarget = [...els.pagesTarget, els.children.item(index.targetSibling)];
      els.pagesAnimating = [els.pagesAnimatingIn, els.pagesAnimatingOut];

      els.pagesActive.forEach((page) => {
        page.classList.remove('is-active');
        page.classList.add('was-active');
      });
      els.pagesTarget.forEach((page) => {
        if (!page) return;
        page.classList.add('is-active');
      });

      if (Modernizr.csstransforms3d) {
        els.pagesAnimating.forEach((page) => {
          if (!page) return;
          page.classList.add('is-animating');
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
                page.classList.remove('is-animating');
              });

              els.pagesActive.forEach((page) => {
                page.classList.remove('was-active');
              });
            }.bind(document),
          );
        });
      });

      options.onPageTurn(el, els);
      // options.onPageTurn(this.isFirstPage(), this.isLastPage());
      // el.dispatchEvent(event);
      // $(this).trigger('pageTurn.heidelberg', [el, els]);

      if (direction == 'forwards' && els.pagesTarget[0].classList.contains('last-page')) {
        el.classList.remove('at-front-cover');
        el.classList.add('at-rear-cover');
      } else if (direction == 'back' && els.pagesTarget[els.pagesTarget.length - 1].classList.contains('first-page')) {
        el.classList.remove('at-rear-cover');
        el.classList.add('at-front-cover');
      } else {
        el.classList.remove('at-rear-cover');
        el.classList.remove('at-front-cover');
      }
    };

    // Heidelberg.prototype.setupSpreads = function () {
    //   const el = this.el;
    //   const options = this.options;
    //   this.el.querySelectorAll('.Heidelberg-Spread').forEach((page) => {
    //     const pageEl = document.createElement('div');
    //     pageEl.classList.add('Heidelberg-Page with-Spread');
    //     pageEl.innerHTML = '';
    //     pageEl.appendChild(page.cloneNode());

    //     page.after(pageEl);
    //     page.replaceWith(pageEl.cloneNode());
    //     // page.parentNode.replaceChild(pageEl.cloneNode());
    //   });

    //   options.onSpreadSetup(el);
    //   // $(this).trigger('spreadSetup.heidelberg', el);
    // };
    return Heidelberg;
  });
})();
