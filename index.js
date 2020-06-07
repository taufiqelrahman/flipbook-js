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
        }
        return new FlipBook(el, options);
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

    FlipBook.prototype.getActivePages = function () {
      const activePages = [];
      this.pages = this.el.querySelectorAll(`.${this.classNames.page}, .${this.classNames.hiddenCover}`);
      Array.from(this.pages).forEach((page, index) => {
        if (page.classList.contains(this.classNames.isActive)) activePages.push(index);
      });
      return activePages;
    };

    FlipBook.prototype.init = function () {
      const { el, options, classNames } = this;
      el.classList.add(classNames.isReady);

      const leftFunction = options.canClose ? 'even' : 'odd';
      const rightFunction = options.canClose ? 'odd' : 'even';
      let pagesLeft = el.querySelectorAll(`.${classNames.page}:nth-child(${leftFunction})`);
      pagesLeft = pagesLeft ? Array.from(pagesLeft) : [];
      let pagesRight = el.querySelectorAll(`.${classNames.page}:nth-child(${rightFunction})`);
      pagesRight = pagesRight ? Array.from(pagesRight) : [];

      // if initialActivePage is odd, substract one.
      let initialActivePage = options.initialActivePage;
      if (initialActivePage & 1) initialActivePage = initialActivePage - 1;

      if (!options.canClose) {
        const coverEl = document.createElement('div');
        coverEl.classList.add(classNames.hiddenCover);
        el.prepend(coverEl.cloneNode());
        el.append(coverEl.cloneNode());
      } else if (options.initialActivePage === 0) {
        this.pages.item(0).classList.add(classNames.isActive);
      }
      if ((options.initialActivePage !== 0 && options.canClose) || !options.canClose) {
        Array.from(this.pages).forEach((page, index) => {
          if (index === initialActivePage || index === initialActivePage + 1) {
            page.classList.add(classNames.isActive);
          }
        });
      }

      let initInterval;
      if (options.initialCall && pagesRight[0]) {
        const setupCalls = () => {
          pagesRight[0].classList.add(classNames.isCalling);
          setTimeout(() => {
            pagesRight[0].classList.remove(classNames.isCalling);
          }, 900);
        };
        setTimeout(setupCalls, 500);
        initInterval = setInterval(setupCalls, 3000);
      }

      if (options.previousButton) pagesLeft = [...pagesLeft, options.previousButton];
      if (options.nextButton) pagesRight = [...pagesRight, options.nextButton];
      pagesLeft.forEach((el) => el.addEventListener('click', () => this.turnPage('back')));
      pagesRight.forEach((el) =>
        el.addEventListener('click', () => {
          this.turnPage('forward');
          if (options.initialCall) clearInterval(initInterval);
        }),
      );

      if (options.arrowKeys) {
        document.addEventListener('keydown', ({ keyCode }) => {
          let forwardKeycode = Modernizr.csstransforms3d ? 39 : 37;
          let backKeycode = Modernizr.csstransforms3d ? 37 : 39;
          if (keyCode === backKeycode) this.turnPage('back');
          if (keyCode === forwardKeycode) {
            this.turnPage('forward');
            if (options.initialCall) clearInterval(initInterval);
          }
        });
      }
    };

    FlipBook.prototype.isLastPage = function () {
      const activeLeft = this.getActivePages()[0];
      return this.pages.last().index() === activeLeft;
    };

    FlipBook.prototype.isFirstPage = function () {
      const activeRight = this.getActivePages()[0];
      return this.pages.first().index() === activeRight;
    };

    FlipBook.prototype.turnPage = function (direction) {
      const { el, options, classNames } = this;

      const pagesActive = el.querySelectorAll(`.${classNames.page}.${classNames.isActive}`);
      let pagesAnimating = el.querySelectorAll(`.${classNames.page}.${classNames.isAnimating}`);
      const children = el.querySelectorAll(`.${classNames.page}, .${classNames.hiddenCover}`);

      const maxAnimationsBrowser = !Modernizr.preserve3d && pagesAnimating.length > 2;
      if (maxAnimationsBrowser) return;

      // handle first and last page
      const activeLeft = this.getActivePages()[0];
      const activeRight = activeLeft + 1;
      const isFirstPage = activeLeft === (options.canClose ? 0 : 1) && direction === 'back';
      const isLastPage =
        activeRight === (options.canClose ? this.pages.length - 1 : this.pages.length - 2) && direction === 'forward';
      if (isFirstPage || isLastPage) return;

      let target;
      let targetSibling;
      if (typeof direction === 'number') {
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
        target = direction === 'forward' ? activeRight + 1 : activeLeft - 1;
        targetSibling = direction === 'forward' ? activeRight + 2 : activeLeft - 2;
      }

      if (direction === 'forward' && target === 2) {
        target = 1;
        targetSibling = 2;
      }

      const pagesAnimatingOut = direction === 'back' ? pagesActive.item(0) : pagesActive.item(1);
      let pagesAnimatingIn = children.item(target);
      let pagesTarget = [pagesAnimatingIn];
      if (targetSibling !== -1) pagesTarget = [...pagesTarget, children.item(targetSibling)];
      pagesAnimating = [pagesAnimatingIn, pagesAnimatingOut];

      pagesActive.forEach((page) => {
        page.classList.remove(classNames.isActive);
        page.classList.add(classNames.wasActive);
      });
      pagesTarget.forEach((page) => {
        if (!page) return;
        page.classList.add(classNames.isActive);
      });

      if (Modernizr.csstransforms3d) {
        pagesAnimating.forEach((page) => {
          if (!page) return;
          page.classList.add(classNames.isAnimating);
        });
      }

      pagesAnimating.forEach((page) => {
        if (!page) return;
        const endEvents = ['webkitTransitionEnd', 'oTransitionEnd', 'msTransitionEnd', 'transitionend'];
        endEvents.forEach((trans) => {
          const _ = this;
          page.addEventListener(trans, () => {
            pagesAnimating.forEach((page) => {
              if (!page) return;
              page.classList.remove(_.classNames.isAnimating);
            });
            pagesActive.forEach((page) => {
              page.classList.remove(_.classNames.wasActive);
            });
          });
        });
      });

      if (options.canClose) {
        const lastTarget = pagesTarget[pagesTarget.length - 1];
        const targetIsLastPage = pagesTarget[0] && pagesTarget[0].classList.contains(classNames.lastPage);
        const targetIsFirstPage = lastTarget && lastTarget.classList.contains(classNames.firstPage);
        if (direction === 'back' && targetIsFirstPage) {
          el.classList.remove(classNames.atBackCover);
          el.classList.add(classNames.atFrontCover);
        } else if (direction === 'forward' && targetIsLastPage) {
          el.classList.remove(classNames.atFrontCover);
          el.classList.add(classNames.atBackCover);
        } else {
          el.classList.remove(classNames.atBackCover);
          el.classList.remove(classNames.atFrontCover);
        }
      }

      options.onPageTurn(el, { pagesActive, children });
    };
    return FlipBook;
  });
})();
