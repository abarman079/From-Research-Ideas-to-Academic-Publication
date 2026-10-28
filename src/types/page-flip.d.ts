declare module "page-flip" {
  type FlipCorner = "top" | "bottom";

  interface FlipSettings {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    usePortrait?: boolean;
    showCover?: boolean;
    autoSize?: boolean;
    drawShadow?: boolean;
    maxShadowOpacity?: number;
    flippingTime?: number;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: FlipSettings);

    on(
      event: "flip",
      callback: (event: { data: number | string }) => void,
    ): this;

    loadFromImages(images: string[]): void;

    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    flip(page: number, corner?: FlipCorner): void;

    turnToNextPage(): void;
    turnToPrevPage(): void;
    turnToPage(page: number): void;

    destroy(): void;
  }
}
