import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from "@angular/core";
import {faBars, IconDefinition} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-core-menu-button",
  templateUrl: "./menu-button.component.html",
  styleUrls: ["./menu-button.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class MenuButtonComponent implements OnInit {

  menuIcon: IconDefinition;
  @Output() toggled: EventEmitter<void>;

  constructor() {
    this.menuIcon = faBars;
    this.toggled = new EventEmitter<void>();
  }

  ngOnInit() { }

  toggleMenu(): void {
    this.toggled.emit();
  }
}
