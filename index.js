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
      if (!(this instanceof FlipBook)) {
        if (el.length) {
          Array.prototype.forEach.call(el, function (n) {
            return new FlipBook(n, options);
          });
        } else {
          return new FlipBook(el, options);
        }
      }

      // OPTIONS
      const defaults = {
        nextButton: document.getElementById(''),
        previousButton: document.getElementById(''),
        canClose: false,
        arrowKeys: true,
        initialActivePage: 0,
        onPageTurn: function () {},
        initialCall: false,
        width: '800px',
        height: '283px',
      };
      this.options = { ...defaults, ...options };
      this.classNames = {
        page: 'c-flipbook__page',
        hiddenCover: 'hidden-cover',
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
        if (this.options.initialActivePage === 0) {
          this.el.classList.add(this.classNames.atFrontCover);
        }
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
      const { el, options, classNames } = this;
      const els = {};
      el.classList.add(classNames.isReady);

      const leftFunction = options.canClose ? 'even' : 'odd';
      const rightFunction = options.canClose ? 'odd' : 'even';
      els.pagesLeft = el.querySelectorAll(`.${classNames.page}:nth-child(${leftFunction})`);
      els.pagesRight = el.querySelectorAll(`.${classNames.page}:nth-child(${rightFunction})`);

      // if initialActivePage is odd, substract one.
      const initialActivePage =
        options.initialActivePage & 1 ? options.initialActivePage - 1 : options.initialActivePage;

      const pagesArr = Array.from(this.pages);
      if (!options.canClose) {
        const coverEl = document.createElement('div');
        coverEl.classList.add(classNames.hiddenCover);
        el.prepend(coverEl.cloneNode());
        el.append(coverEl.cloneNode());
      } else if (options.initialActivePage === 0) {
        this.pages.item(0).classList.add(classNames.isActive);
      }
      if ((options.initialActivePage !== 0 && options.canClose) || !options.canClose) {
        pagesArr.forEach((page, index) => {
          if (index === initialActivePage || index === initialActivePage + 1) {
            page.classList.add(classNames.isActive);
          }
        });
      }

      let initInterval;
      if (options.initialCall) {
        const setupCalls = () => {
          els.pagesRight.item(0).classList.add(classNames.isCalling);
          setTimeout(() => {
            els.pagesRight.item(0).classList.remove(classNames.isCalling);
          }, 900);
        };
        setTimeout(setupCalls, 500);
        initInterval = setInterval(setupCalls, 3000);
      }

      els.previousTrigger = [...Array.from(els.pagesLeft), options.previousButton];
      els.nextTrigger = [...Array.from(els.pagesRight), options.nextButton];
      els.previousTrigger.forEach((el) => {
        if (!el) return;
        el.addEventListener('click', () => {
          this.turnPage('back');
        });
      });
      els.nextTrigger.forEach((el) => {
        if (!el) return;
        el.addEventListener('click', () => {
          this.turnPage('forward');
          if (options.initialCall) clearInterval(initInterval);
        });
      });

      let forwardKeycode = 37;
      let backKeycode = 39;
      if (!Modernizr.csstransforms3d) {
        forwardKeycode = 39;
        backKeycode = 37;
      }
      if (options.arrowKeys) {
        document.addEventListener('keydown', (e) => {
          if (e.keyCode === forwardKeycode) {
            this.turnPage('forward');
            if (options.initialCall) clearInterval(initInterval);
            return false;
          }
          if (e.keyCode === backKeycode) {
            this.turnPage('back');
            return false;
          }
        });
      }
    };

    FlipBook.prototype.isLastPage = function () {
      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains(this.classNames.isActive)) {
          activePages.push(index);
        }
      });
      const activeLeft = activePages[0];
      return this.pages.last().index() == activeLeft;
    };

    FlipBook.prototype.isFirstPage = function () {
      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains(this.classNames.isActive)) {
          activePages.push(index);
        }
      });
      const activeRight = activePages[0];
      return this.pages.first().index() == activeRight;
    };

    FlipBook.prototype.turnPage = function (direction) {
      const { el, options, classNames } = this;
      const els = {};

      els.pagesActive = el.querySelectorAll(`.${classNames.page}.${classNames.isActive}`);
      els.pagesAnimating = el.querySelectorAll(`.${classNames.page}.${classNames.isAnimating}`);
      els.children = el.querySelectorAll(`.${classNames.page}, .${classNames.hiddenCover}`);

      const maxAnimationsBrowser = !Modernizr.preserve3d && els.pagesAnimating.length > 2;
      if (maxAnimationsBrowser) {
        return;
      }

      const activePages = [];
      this.getPages().forEach((page, index) => {
        if (page.classList.contains(classNames.isActive)) {
          activePages.push(index);
        }
      });

      const activeLeft = activePages[0]; // Note about fix: the double spread code above caused code to wrap to bottom of array . This is the fix for double spreads.
      const activeRight = activeLeft + 1;

      const isFirstPage = activeLeft === (options.canClose ? 0 : 1) && direction == 'back';
      const isLastPage =
        activeRight === (options.canClose ? this.pages.length - 1 : this.pages.length - 2) && direction == 'forward';

      if (isFirstPage || isLastPage) return;

      let target;
      let targetSibling;
      if (typeof direction == 'number') {
        const isOdd = direction & 1;
        const isRight = options.canClose ? isOdd : !isOdd;

        const targetRight = isRight ? direction : direction + 1;
        const targetLeft = targetRight - 1;
        if (targetLeft === activeLeft) return;
        if (targetLeft > activeRight) {
          direction = 'forward';
          target = targetLeft;
          targetSibling = target + 1;
        } else {
          direction = 'back';
          target = targetRight;
          targetSibling = target - 1;
        }

        target = target - 1;
        targetSibling = targetSibling - 1;
      } else {
        target = direction == 'forward' ? activeRight + 1 : activeLeft - 1;
        targetSibling = direction == 'forward' ? activeRight + 2 : activeLeft - 2;
      }

      if (direction == 'forward' && target == 2) {
        target = 1;
        targetSibling = 2;
      }

      els.pagesAnimatingOut = direction == 'back' ? els.pagesActive.item(0) : els.pagesActive.item(1);
      els.pagesAnimatingIn = els.children.item(target);
      els.pagesTarget = [els.pagesAnimatingIn];
      if (targetSibling !== -1) els.pagesTarget = [...els.pagesTarget, els.children.item(targetSibling)];
      els.pagesAnimating = [els.pagesAnimatingIn, els.pagesAnimatingOut];

      els.pagesActive.forEach((page) => {
        page.classList.remove(classNames.isActive);
        page.classList.add(classNames.wasActive);
      });
      els.pagesTarget.forEach((page) => {
        if (!page) return;
        page.classList.add(classNames.isActive);
      });

      if (Modernizr.csstransforms3d) {
        els.pagesAnimating.forEach((page) => {
          if (!page) return;
          page.classList.add(classNames.isAnimating);
        });
      }

      els.pagesAnimating.forEach((page) => {
        if (!page) return;
        const endEvents = ['webkitTransitionEnd', 'oTransitionEnd', 'msTransitionEnd', 'transitionend'];
        endEvents.forEach((trans) => {
          const _ = this;
          page.addEventListener(trans, () => {
            els.pagesAnimating.forEach((page) => {
              if (!page) return;
              page.classList.remove(_.classNames.isAnimating);
            });

            els.pagesActive.forEach((page) => {
              page.classList.remove(_.classNames.wasActive);
            });
          });
        });
      });

      const lastTarget = els.pagesTarget[els.pagesTarget.length - 1];
      const targetIsLastPage = els.pagesTarget[0] && els.pagesTarget[0].classList.contains(classNames.lastPage);
      const targetIsFirstPage = lastTarget && lastTarget.classList.contains(classNames.firstPage);
      if (direction == 'back' && targetIsFirstPage) {
        el.classList.remove(classNames.atBackCover);
        el.classList.add(classNames.atFrontCover);
      } else if (direction == 'forward' && targetIsLastPage) {
        el.classList.remove(classNames.atFrontCover);
        el.classList.add(classNames.atBackCover);
      } else {
        el.classList.remove(classNames.atBackCover);
        el.classList.remove(classNames.atFrontCover);
      }

      options.onPageTurn(el, els);
    };
    return FlipBook;
  });
})();
