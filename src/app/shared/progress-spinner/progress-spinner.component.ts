import {Component, DoCheck, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {ThemePalette} from "@angular/material/core";
import {ProgressSpinnerMode} from "@angular/material/progress-spinner";
import {OverlayRef} from "@angular/cdk/overlay";
import {AppOverlayConfig, OverlayService} from "./overlay.service";
import {ProgressSpinnerService} from "./progress-spinner.service";


@Component({
  selector: "app-progress-spinner",
  templateUrl: "./progress-spinner.component.html",
  styleUrls: ["./progress-spinner.component.scss"]
})
export class ProgressSpinnerComponent implements OnInit, DoCheck {
  @Input() color?: ThemePalette;
  @Input() diameter = 100;
  @Input() mode?: ProgressSpinnerMode;
  @Input() strokeWidth?: number;
  @Input() value?: number;
  @Input() backdropEnabled = true;
  @Input() positionGloballyCenter = true;
  private displayProgressSpinner: boolean;

  @ViewChild("progressSpinnerRef", {static: true})
  private progressSpinnerRef: TemplateRef<any>;
  private progressSpinnerOverlayConfig: AppOverlayConfig;
  private overlayRef: OverlayRef;

  constructor(private vcRef: ViewContainerRef,
              private overlayService: OverlayService,
              private spinnerService: ProgressSpinnerService) {
    spinnerService.isProgressing.subscribe(value => this.displayProgressSpinner = value);
  }

  ngOnInit() {
    // Config for Overlay Service
    this.progressSpinnerOverlayConfig = {
      hasBackdrop: this.backdropEnabled
    };
    if (this.positionGloballyCenter) {
      this.progressSpinnerOverlayConfig.positionStrategy = this.overlayService.positionGloballyCenter();
    }
    // Create Overlay for progress spinner
    this.overlayRef = this.overlayService.createOverlay(this.progressSpinnerOverlayConfig);
  }

  ngDoCheck() {
    // Based on status of displayProgressSpinner attach/detach overlay to progress spinner template
    if (this.displayProgressSpinner && !this.overlayRef.hasAttached()) {
      this.overlayService.attachTemplatePortal(this.overlayRef, this.progressSpinnerRef, this.vcRef);
    } else if (!this.displayProgressSpinner && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }
}
