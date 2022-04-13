import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {SharedMaterialModule} from "./shared.material.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ProgressSpinnerModule} from "./progress-spinner/progress-spinner.module";
import {EnterTheViewportNotifierDirective} from "./directives/enter-the-viewport-notifier.directive";
import {YesNoDialogComponent} from "./dialogs/yes-no-dialog/yes-no-dialog.component";

@NgModule({
  declarations: [
    EnterTheViewportNotifierDirective,
    YesNoDialogComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    SharedMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
  ],
  exports: [
    CommonModule,
    FontAwesomeModule,
    SharedMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    EnterTheViewportNotifierDirective
  ]
})
export class SharedModule {
}
