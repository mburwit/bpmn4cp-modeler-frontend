import {BrowserModule} from "@angular/platform-browser";
import {APP_INITIALIZER, Injector, NgModule} from "@angular/core";

import {AppComponent} from "./app.component";
import {MainLayoutComponent} from "./layouts/main-layout.component";
import {AppRoutingModule} from "./app-routing.module";
import {CoreModule} from "./core/core.module";
import {KeycloakAngularModule, KeycloakService} from "keycloak-angular";
import {BasicAuthInterceptor, initializer, InjectorHolder} from "./app-init";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    KeycloakAngularModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      multi: true,
      deps: [KeycloakService]
    },
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  // share injector to inject in static contexts
  constructor(public injector: Injector) {
    InjectorHolder.angularInjector = injector;
  }
}
