import {NgModule} from "@angular/core";
import {ContainerComponent} from "./container/container.component";
import {ContentComponent} from "./content/content.component";
import {NavigationComponent} from "./navigation/navigation.component";
import {ToolbarComponent} from "./toolbar/toolbar.component";
import {MenuButtonComponent} from "./menu-button/menu-button.component";
import {AppRoutingModule} from "../app-routing.module";
import {SharedMaterialModule} from "../shared/shared.material.module";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {AccessDeniedComponent} from "./access-denied/access-denied.component";
import {CommonModule} from "@angular/common";

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    FontAwesomeModule,
    SharedMaterialModule
  ],
  exports: [
    ContainerComponent
  ],
  declarations: [
    ContainerComponent,
    ContentComponent,
    NavigationComponent,
    ToolbarComponent,
    MenuButtonComponent,
    AccessDeniedComponent
  ]
})
export class CoreModule {
}
