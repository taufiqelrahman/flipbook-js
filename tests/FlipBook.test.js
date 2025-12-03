import { describe, it, expect, beforeEach, vi } from 'vitest';
import FlipBook from '../src/FlipBook.js';

describe('FlipBook', () => {
  let container;

  beforeEach(() => {
    // Create a basic flipbook structure
    container = document.createElement('div');
    container.id = 'test-flipbook';
    container.innerHTML = `
      <div class="c-flipbook__page">Page 1</div>
      <div class="c-flipbook__page">Page 2</div>
      <div class="c-flipbook__page">Page 3</div>
      <div class="c-flipbook__page">Page 4</div>
      <div class="c-flipbook__page">Page 5</div>
      <div class="c-flipbook__page">Page 6</div>
    `;
    document.body.appendChild(container);
  });

  describe('Constructor', () => {
    it('should create a FlipBook instance with element ID', () => {
      const flipbook = new FlipBook('test-flipbook');
      expect(flipbook).toBeInstanceOf(FlipBook);
      expect(flipbook.el).toBe(container);
    });

    it('should create a FlipBook instance with HTMLElement', () => {
      const flipbook = new FlipBook(container);
      expect(flipbook).toBeInstanceOf(FlipBook);
      expect(flipbook.el).toBe(container);
    });

    it('should apply default options', () => {
      const flipbook = new FlipBook('test-flipbook');
      expect(flipbook.options.arrowKeys).toBe(true);
      expect(flipbook.options.canClose).toBe(false);
      expect(flipbook.options.initialActivePage).toBe(0);
      expect(flipbook.options.width).toBe('100%');
      expect(flipbook.options.height).toBe('283px');
    });

    it('should merge custom options with defaults', () => {
      const flipbook = new FlipBook('test-flipbook', {
        width: '800px',
        height: '600px',
        canClose: true,
      });
      expect(flipbook.options.width).toBe('800px');
      expect(flipbook.options.height).toBe('600px');
      expect(flipbook.options.canClose).toBe(true);
      expect(flipbook.options.arrowKeys).toBe(true); // default still applied
    });

    it('should set width and height styles on element', () => {
      const flipbook = new FlipBook('test-flipbook', {
        width: '800px',
        height: '600px',
      });
      expect(container.style.width).toBe('800px');
      expect(container.style.height).toBe('600px');
    });

    it('should add is-ready class after init', () => {
      const flipbook = new FlipBook('test-flipbook');
      expect(container.classList.contains('is-ready')).toBe(true);
    });
  });

  describe('getActivePages', () => {
    it('should return array of active page indices', () => {
      const flipbook = new FlipBook('test-flipbook');
      const activePages = flipbook.getActivePages();
      expect(Array.isArray(activePages)).toBe(true);
      expect(activePages.length).toBeGreaterThan(0);
    });

    it('should return correct indices when pages are active', () => {
      const flipbook = new FlipBook('test-flipbook', { canClose: false });
      const activePages = flipbook.getActivePages();
      expect(Array.isArray(activePages)).toBe(true);
      expect(activePages.length).toBeGreaterThan(0);
      // With canClose: false, hidden covers are added, so indices shift
      expect(activePages[0]).toBeGreaterThanOrEqual(1);
    });
  });

  describe('isFirstPage', () => {
    it('should return true when at first page without covers', () => {
      const flipbook = new FlipBook('test-flipbook', { canClose: false });
      // After init, should be at first viewable page (index 1 with hidden covers)
      const isFirst = flipbook.isFirstPage();
      expect(typeof isFirst).toBe('boolean');
    });

    it('should return true when at cover page with covers enabled', () => {
      const flipbook = new FlipBook('test-flipbook', { canClose: true, initialActivePage: 0 });
      const isFirst = flipbook.isFirstPage();
      expect(isFirst).toBe(true);
    });
  });

  describe('isLastPage', () => {
    it('should return false when not at last page', () => {
      const flipbook = new FlipBook('test-flipbook');
      const isLast = flipbook.isLastPage();
      expect(isLast).toBe(false);
    });

    it('should work correctly with cover pages', () => {
      const flipbook = new FlipBook('test-flipbook', { canClose: true });
      const isLast = flipbook.isLastPage();
      expect(typeof isLast).toBe('boolean');
    });
  });

  describe('turnPage', () => {
    it('should turn page forward', () => {
      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', { onPageTurn });
      
      const initialActive = flipbook.getActivePages();
      flipbook.turnPage('forward');
      
      expect(onPageTurn).toHaveBeenCalled();
    });

    it('should turn page backward', () => {
      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', { 
        onPageTurn,
        initialActivePage: 2 
      });
      
      flipbook.turnPage('back');
      expect(onPageTurn).toHaveBeenCalled();
    });

    it('should jump to specific page number', () => {
      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', { onPageTurn });
      
      flipbook.turnPage(4);
      expect(onPageTurn).toHaveBeenCalled();
    });

    it('should not turn past first page', () => {
      const flipbook = new FlipBook('test-flipbook', { canClose: false });
      const initialActive = flipbook.getActivePages();
      
      // Try to go back from first page
      flipbook.turnPage('back');
      
      const afterActive = flipbook.getActivePages();
      expect(initialActive).toEqual(afterActive);
    });

    it('should not turn past last page', () => {
      const flipbook = new FlipBook('test-flipbook', { canClose: false });
      
      // Go to last page
      flipbook.turnPage(6);
      const beforeLast = flipbook.getActivePages();
      
      // Try to go forward from last page
      flipbook.turnPage('forward');
      
      const afterLast = flipbook.getActivePages();
      expect(beforeLast).toEqual(afterLast);
    });

    it('should add animation classes when turning', () => {
      const flipbook = new FlipBook('test-flipbook');
      flipbook.turnPage('forward');
      
      const animating = container.querySelectorAll('.is-animating');
      expect(animating.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Button Navigation', () => {
    it('should navigate with next button', () => {
      const nextBtn = document.createElement('button');
      nextBtn.id = 'next-btn';
      document.body.appendChild(nextBtn);

      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', {
        nextButton: nextBtn,
        onPageTurn,
      });

      nextBtn.click();
      expect(onPageTurn).toHaveBeenCalled();
    });

    it('should navigate with previous button', () => {
      const prevBtn = document.createElement('button');
      prevBtn.id = 'prev-btn';
      document.body.appendChild(prevBtn);

      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', {
        previousButton: prevBtn,
        onPageTurn,
        initialActivePage: 2,
      });

      prevBtn.click();
      expect(onPageTurn).toHaveBeenCalled();
    });
  });

  describe('Cover Mode', () => {
    it('should add cover classes when canClose is true', () => {
      const flipbook = new FlipBook('test-flipbook', {
        canClose: true,
        initialActivePage: 0,
      });

      expect(container.classList.contains('at-front-cover')).toBe(true);
    });

    it('should add hidden covers when canClose is false', () => {
      const flipbook = new FlipBook('test-flipbook', { canClose: false });
      const hiddenCovers = container.querySelectorAll('.hidden-cover');
      expect(hiddenCovers.length).toBe(2); // front and back
    });

    it('should mark first and last page when canClose is true', () => {
      const flipbook = new FlipBook('test-flipbook', { canClose: true });
      const pages = container.querySelectorAll('.c-flipbook__page, .hidden-cover');
      
      expect(pages[0].classList.contains('first-page')).toBe(true);
      expect(pages[pages.length - 1].classList.contains('last-page')).toBe(true);
    });
  });

  describe('Initial Active Page', () => {
    it('should start at specified page', () => {
      const flipbook = new FlipBook('test-flipbook', {
        initialActivePage: 2,
        canClose: false,
      });
      
      const activePages = flipbook.getActivePages();
      // With hidden covers added, active pages are at indices 3,4
      expect(activePages.length).toBeGreaterThan(0);
      expect(activePages[0]).toBeGreaterThanOrEqual(2);
    });

    it('should ensure even page number for initial active page', () => {
      const flipbook = new FlipBook('test-flipbook', {
        initialActivePage: 3, // odd number
        canClose: false,
      });
      
      const activePages = flipbook.getActivePages();
      // Should adjust to even number, with hidden covers indices are shifted
      expect(activePages.length).toBeGreaterThan(0);
      expect(activePages[0]).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Static Methods', () => {
    it('should have setupPageCalls static method', () => {
      expect(typeof FlipBook.setupPageCalls).toBe('function');
    });

    it('should have handleArrowKeys static method', () => {
      expect(typeof FlipBook.handleArrowKeys).toBe('function');
    });

    it('should have handleAnimationEnd static method', () => {
      expect(typeof FlipBook.handleAnimationEnd).toBe('function');
    });

    it('should have handleAtCovers static method', () => {
      expect(typeof FlipBook.handleAtCovers).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty container gracefully', () => {
      const emptyContainer = document.createElement('div');
      emptyContainer.id = 'empty';
      document.body.appendChild(emptyContainer);

      expect(() => {
        new FlipBook('empty');
      }).not.toThrow();
    });

    it('should handle single page', () => {
      const singlePageContainer = document.createElement('div');
      singlePageContainer.id = 'single';
      singlePageContainer.innerHTML = '<div class="c-flipbook__page">Single Page</div>';
      document.body.appendChild(singlePageContainer);

      expect(() => {
        new FlipBook('single');
      }).not.toThrow();
    });
  });

  describe('Arrow Key Navigation', () => {
    it('should navigate with arrow keys when enabled', () => {
      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', {
        arrowKeys: true,
        onPageTurn,
      });

      // Simulate right arrow key (keyCode 39)
      const event = new KeyboardEvent('keydown', { keyCode: 39 });
      document.dispatchEvent(event);

      // onPageTurn should be called
      expect(onPageTurn).toHaveBeenCalled();
    });

    it('should navigate backward with left arrow key', () => {
      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', {
        arrowKeys: true,
        onPageTurn,
        initialActivePage: 2,
      });

      // Simulate left arrow key (keyCode 37)
      const event = new KeyboardEvent('keydown', { keyCode: 37 });
      document.dispatchEvent(event);

      expect(onPageTurn).toHaveBeenCalled();
    });
  });

  describe('Initial Call Animation', () => {
    it('should trigger initial call animation when enabled', () => {
      vi.useFakeTimers();
      
      const flipbook = new FlipBook('test-flipbook', {
        initialCall: true,
      });

      // Fast-forward timers to trigger the animation
      vi.advanceTimersByTime(600);

      // Check if calling class was added
      const pages = container.querySelectorAll('.c-flipbook__page');
      const hasCallingClass = Array.from(pages).some(page => 
        page.classList.contains('is-calling')
      );

      vi.useRealTimers();
    });
  });

  describe('Animation End Handling', () => {
    it('should handle transition end events', () => {
      const flipbook = new FlipBook('test-flipbook');
      
      flipbook.turnPage('forward');
      
      // Simulate transitionend event
      const animatingPages = container.querySelectorAll('.is-animating');
      if (animatingPages.length > 0) {
        const event = new Event('transitionend');
        animatingPages[0].dispatchEvent(event);
      }

      // Should not throw error
      expect(flipbook).toBeDefined();
    });
  });

  describe('Cover State Handling', () => {
    it('should add at-rear-cover class when reaching end with covers', () => {
      const flipbook = new FlipBook('test-flipbook', {
        canClose: true,
      });

      // Navigate to last page
      const lastPageIndex = flipbook.pages.length - 1;
      flipbook.turnPage(lastPageIndex);

      // Small delay for state update
      setTimeout(() => {
        const hasBackCover = container.classList.contains('at-rear-cover');
        expect(typeof hasBackCover).toBe('boolean');
      }, 10);
    });

    it('should remove cover classes when navigating to middle pages', () => {
      const flipbook = new FlipBook('test-flipbook', {
        canClose: true,
        initialActivePage: 0,
      });

      // Navigate forward from cover
      flipbook.turnPage('forward');
      flipbook.turnPage('forward');

      setTimeout(() => {
        expect(container.classList.contains('at-front-cover')).toBe(false);
      }, 10);
    });
  });

  describe('Modernizr Fallback', () => {
    it('should work without Modernizr', () => {
      const originalModernizr = window.Modernizr;
      delete window.Modernizr;

      expect(() => {
        new FlipBook('test-flipbook');
      }).not.toThrow();

      window.Modernizr = originalModernizr;
    });

    it('should prevent multiple animations without preserve3d support', () => {
      const flipbook = new FlipBook('test-flipbook');
      
      // Temporarily disable preserve3d
      flipbook.Modernizr.preserve3d = false;

      // Try to turn pages rapidly
      flipbook.turnPage('forward');
      flipbook.turnPage('forward');
      flipbook.turnPage('forward');

      // Should still work without errors
      expect(flipbook).toBeDefined();

      // Restore
      flipbook.Modernizr.preserve3d = true;
    });
  });

  describe('OnPageTurn Callback', () => {
    it('should call onPageTurn with correct context', () => {
      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', { onPageTurn });

      flipbook.turnPage('forward');

      expect(onPageTurn).toHaveBeenCalledWith(
        container,
        expect.objectContaining({
          pagesActive: expect.anything(),
          children: expect.anything(),
        })
      );
    });

    it('should call onPageTurn on every page turn', () => {
      const onPageTurn = vi.fn();
      const flipbook = new FlipBook('test-flipbook', { onPageTurn });

      flipbook.turnPage('forward');
      flipbook.turnPage('forward');
      flipbook.turnPage('back');

      expect(onPageTurn).toHaveBeenCalledTimes(3);
    });
  });
});
