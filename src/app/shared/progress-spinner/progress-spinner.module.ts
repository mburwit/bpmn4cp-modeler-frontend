import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {ProgressSpinnerComponent} from './progress-spinner.component';
import {OverlayModule} from "@angular/cdk/overlay";
import {OverlayService} from "./overlay.service";
import {ProgressSpinnerService} from "./progress-spinner.service";

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MatProgressSpinnerModule
  ],
  declarations: [ProgressSpinnerComponent],
  exports: [
    OverlayModule,
    ProgressSpinnerComponent
  ],
  providers: [
    OverlayService,
    ProgressSpinnerService
  ]
})
export class ProgressSpinnerModule {
}
