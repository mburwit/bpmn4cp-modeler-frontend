import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GalleryComponent } from "./components/gallery.component";
import {SharedModule} from "../shared/shared.module";
import {TemplateFormDialogComponent} from "./components/template-form-dialog/template-form-dialog.component";
import {IcdBrowserDialogComponent} from "./components/icd-browser-dialog/icd-browser-dialog.component";
import {GalleryItemComponent} from "./components/gallery-item/gallery-item.component";
import {GalleryRoutingModule} from "./gallery.routing.module";

@NgModule({
  declarations: [
    GalleryComponent,
    GalleryItemComponent,
    TemplateFormDialogComponent,
    IcdBrowserDialogComponent
  ],
  imports: [
    CommonModule,
    GalleryRoutingModule,
    SharedModule
  ]
})
export class GalleryModule { }
