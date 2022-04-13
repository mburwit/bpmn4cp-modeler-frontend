import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-core-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class ToolbarComponent implements OnInit {

  @Output() toggledMenu: EventEmitter<void>;

  constructor() {
    this.toggledMenu = new EventEmitter<void>();
  }

  ngOnInit() { }

  bubbleUpOnToggledMenu(): void {
    this.toggledMenu.emit();
  }
}
