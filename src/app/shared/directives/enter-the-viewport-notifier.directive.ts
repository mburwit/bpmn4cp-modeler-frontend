import { AfterViewInit, Directive, ElementRef, EventEmitter, Host, OnDestroy, Output } from "@angular/core";

@Directive({
  selector: "[appEnterTheViewportNotifier]"
})
export class EnterTheViewportNotifierDirective implements AfterViewInit, OnDestroy {
  @Output() visibilityChange: EventEmitter<string> = new EventEmitter<string>();

  private observer: IntersectionObserver;

  constructor(@Host() private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.0
    };

    this.observer = new IntersectionObserver(this.callback, options);
    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  private callback = (entries) => {
    entries.forEach(entry => {
      this.visibilityChange.emit(entry.isIntersecting ? "VISIBLE" : "HIDDEN");
    });
  }
}
