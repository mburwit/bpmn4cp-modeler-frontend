import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ModelerCanvasComponent} from "./components/modeler/modeler-canvas/modeler-canvas.component";
import {ModelerToolbarComponent} from "./components/modeler/modeler-toolbar/modeler-toolbar.component";
import {ModelerComponent} from "./components/modeler/modeler.component";
import {FileUploadModule} from "ng2-file-upload";
import {SharedModule} from "../shared/shared.module";
import {MatMenuModule} from "@angular/material/menu";
import {ModelerRoutingModule} from "./modeler.routing.module";
import {ModelerContainerComponent} from "./components/container/modeler.container.component";
import {BrowserGlobalRef, GlobalRef} from "../shared/global/global";

@NgModule({
  declarations: [
    ModelerComponent,
    ModelerCanvasComponent,
    ModelerToolbarComponent,
    ModelerContainerComponent
  ],
  imports: [
    CommonModule,
    ModelerRoutingModule,
    SharedModule,
    FileUploadModule,
    MatMenuModule
  ],
  providers: [
    {
      provide: GlobalRef,
      useClass: BrowserGlobalRef
    }
  ],
  exports: [
    ModelerComponent,
    SharedModule
  ]
})
export class ModelerModule {
}
