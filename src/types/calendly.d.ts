interface Calendly {
  initPopupWidget(options: { url: string }): void;
  closePopupWidget(): void;
  showPopupWidget(url: string): void;
}

declare const Calendly: Calendly;