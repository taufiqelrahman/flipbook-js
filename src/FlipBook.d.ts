// Type definitions for flipbook-js
// Project: flipbook-js
// Definitions by: Taufiq El Rahman

export interface FlipBookOptions {
  nextButton?: HTMLElement | null;
  previousButton?: HTMLElement | null;
  canClose?: boolean;
  arrowKeys?: boolean;
  initialActivePage?: number;
  onPageTurn?: (el: HTMLElement, context: { pagesActive: NodeListOf<HTMLElement>; children: NodeListOf<HTMLElement> }) => void;
  initialCall?: boolean;
  width?: string;
  height?: string;
}

export default class FlipBook {
  constructor(el: string | HTMLElement, options?: FlipBookOptions);
  getActivePages(): number[];
  init(): void;
  isLastPage(): boolean;
  isFirstPage(): boolean;
  turnPage(direction: 'forward' | 'back' | number): void;
  static setupPageCalls(
    pagesRight: HTMLElement[],
    classNames: Record<string, string>,
    initInterval: number
  ): number;
  static handleArrowKeys(
    options: FlipBookOptions,
    initInterval: number,
    turnPage: (direction: 'forward' | 'back' | number) => void,
    Modernizr: any
  ): void;
  static handleAnimationEnd(
    pagesAnimating: (HTMLElement | undefined)[],
    pagesActive: (HTMLElement | undefined)[],
    context: FlipBook
  ): void;
  static handleAtCovers(
    pagesTarget: (HTMLElement | undefined)[],
    classNames: Record<string, string>,
    direction: 'forward' | 'back',
    el: HTMLElement
  ): void;
}
