
// FlipBook v1.0.0 by Taufiq El Rahman
// Refactored for best practices: ES6 class, clear structure, JSDoc, and no global pollution

/**
 * FlipBook class for creating interactive book-like page flipping UI.
 */
class FlipBook {
  /**
   * @param {string|HTMLElement} el - The element or element ID to attach the flipbook to.
   * @param {Object} options - Configuration options for the flipbook.
   */
  constructor(el, options = {}) {
    // Allow developer to omit 'new' keyword
    if (!(this instanceof FlipBook)) {
      return new FlipBook(el, options);
    }

    // Default options
    const defaults = {
      nextButton: null,
      previousButton: null,
      canClose: false,
      arrowKeys: true,
      initialActivePage: 0,
      onPageTurn: () => {},
      initialCall: false,
      width: '100%',
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

    // Modernizr fallback
    this.Modernizr = window.Modernizr || { csstransforms3d: true };
    if (typeof this.Modernizr.preserve3d !== 'boolean') this.Modernizr.preserve3d = true;

    // Get element by ID or use HTMLElement
    this.el = typeof el === 'string' ? document.getElementById(el) : el;
    this.el.style.width = this.options.width;
    this.el.style.height = this.options.height;
    this.el.setAttribute('data-useragent', navigator.userAgent);
    this.pages = this.el.querySelectorAll(`.${this.classNames.page}, .${this.classNames.hiddenCover}`);
    if (this.options.canClose) {
      if (this.options.initialActivePage === 0) this.el.classList.add(this.classNames.atFrontCover);
      this.pages.item(0).classList.add(this.classNames.firstPage);
      this.pages.item(this.pages.length - 1).classList.add(this.classNames.lastPage);
    }
    this.init();
  }

  /**
   * Returns an array of indices for currently active pages.
   * @returns {number[]}
   */
  getActivePages() {
    this.pages = this.el.querySelectorAll(`.${this.classNames.page}, .${this.classNames.hiddenCover}`);
    return Array.from(this.pages).reduce((acc, page, idx) => {
      if (page.classList.contains(this.classNames.isActive)) acc.push(idx);
      return acc;
    }, []);
  }

  /**
   * Initialize the flipbook, set up event listeners and initial state.
   */
  init() {
    const { el, options, classNames } = this;
    el.classList.add(classNames.isReady);

    const leftChild = options.canClose ? 'even' : 'odd';
    const rightChild = options.canClose ? 'odd' : 'even';
    let pagesLeft = Array.from(el.querySelectorAll(`.${classNames.page}:nth-child(${leftChild})`));
    let pagesRight = Array.from(el.querySelectorAll(`.${classNames.page}:nth-child(${rightChild})`));

    // Ensure initialActivePage is even
    let initialActivePage = options.initialActivePage;
    if (initialActivePage & 1) initialActivePage -= 1;

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
      initInterval = FlipBook.setupPageCalls(pagesRight, classNames, initInterval);
    }

    if (options.previousButton) pagesLeft = [...pagesLeft, options.previousButton];
    if (options.nextButton) pagesRight = [...pagesRight, options.nextButton];
    pagesLeft.forEach((el) => el.addEventListener('click', () => this.turnPage('back')));
    pagesRight.forEach((el) =>
      el.addEventListener('click', () => {
        this.turnPage('forward');
        if (options.initialCall) clearInterval(initInterval);
      })
    );
    if (options.arrowKeys) FlipBook.handleArrowKeys(options, initInterval, this.turnPage.bind(this), this.Modernizr);
  }

  /**
   * Returns true if the current page is the last page.
   * @returns {boolean}
   */
  isLastPage() {
    const activeLeft = this.getActivePages()[0];
    return this.pages.length - 1 === activeLeft;
  }

  /**
   * Returns true if the current page is the first page.
   * @returns {boolean}
   */
  isFirstPage() {
    const activeRight = this.getActivePages()[0];
    return activeRight === 0;
  }

  /**
   * Turn the page in the given direction or to a specific page index.
   * @param {'forward'|'back'|number} direction
   */
  turnPage(direction) {
    const { el, options, classNames, Modernizr } = this;
    const pagesActive = el.querySelectorAll(`.${classNames.page}.${classNames.isActive}`);
    let pagesAnimating = el.querySelectorAll(`.${classNames.page}.${classNames.isAnimating}`);
    const children = el.querySelectorAll(`.${classNames.page}, .${classNames.hiddenCover}`);

    // Prevent too many animations for browsers without preserve3d
    if (!Modernizr.preserve3d && pagesAnimating.length > 2) return;

    // Handle first and last page
    const activeLeft = this.getActivePages()[0];
    const activeRight = activeLeft + 1;
    const isFirstPage = activeLeft === (options.canClose ? 0 : 1) && direction === 'back';
    const isLastPage =
      activeRight === (options.canClose ? this.pages.length - 1 : this.pages.length - 2) && direction === 'forward';
    if (isFirstPage || isLastPage) return;

    let target, targetSibling;
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

    FlipBook.handleAnimationEnd(pagesAnimating, pagesActive, this);
    if (options.canClose) FlipBook.handleAtCovers(pagesTarget, classNames, direction, el);
    options.onPageTurn(el, { pagesActive, children });
  }

  // --- Static utility methods ---

  /**
   * Setup page call animation for the right pages.
   * @private
   */
  static setupPageCalls(pagesRight, classNames, initInterval) {
    const setupCalls = () => {
      pagesRight[0].classList.add(classNames.isCalling);
      setTimeout(() => {
        pagesRight[0].classList.remove(classNames.isCalling);
      }, 900);
    };
    setTimeout(setupCalls, 500);
    initInterval = setInterval(setupCalls, 3000);
    return initInterval;
  }

  /**
   * Handle arrow key navigation for the flipbook.
   * @private
   */
  static handleArrowKeys(options, initInterval, turnPage, Modernizr) {
    document.addEventListener('keydown', ({ keyCode }) => {
      const forwardKeycode = Modernizr.csstransforms3d ? 39 : 37;
      const backKeycode = Modernizr.csstransforms3d ? 37 : 39;
      if (keyCode === backKeycode) turnPage('back');
      if (keyCode === forwardKeycode) {
        turnPage('forward');
        if (options.initialCall) clearInterval(initInterval);
      }
    });
  }

  /**
   * Handle animation end events for page transitions.
   * @private
   */
  static handleAnimationEnd(pagesAnimating, pagesActive, context) {
    pagesAnimating.forEach((page) => {
      if (!page) return;
      const endEvents = ['webkitTransitionEnd', 'oTransitionEnd', 'msTransitionEnd', 'transitionend'];
      endEvents.forEach((trans) => {
        page.addEventListener(trans, () => {
          pagesAnimating.forEach((p) => {
            if (!p) return;
            p.classList.remove(context.classNames.isAnimating);
          });
          pagesActive.forEach((p) => {
            p.classList.remove(context.classNames.wasActive);
          });
        });
      });
    });
  }

  /**
   * Handle cover state classes when at front or back cover.
   * @private
   */
  static handleAtCovers(pagesTarget, classNames, direction, el) {
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
}

// Expose FlipBook globally
window.FlipBook = FlipBook;
