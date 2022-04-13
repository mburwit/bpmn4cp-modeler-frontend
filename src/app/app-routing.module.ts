import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";

import {MainLayoutComponent} from "./layouts/main-layout.component";
import {AppAuthGuard} from "./shared/guards/app.authguard";
import {environment} from "../environments/environment";
import {NoAuthGuard} from "./shared/guards/app.noauthguard";
import {AccessDeniedComponent} from "./core/access-denied/access-denied.component";

const authGuard: [any] = environment.auth.enabled === true ? [AppAuthGuard] : [NoAuthGuard];
const routes: Routes = [
  {
    path: "",
    component: MainLayoutComponent,
    canActivate: authGuard,
    data: {
      roles: [environment.auth.requiredRole]
    },
    children: [
      {path: "", redirectTo: "/gallery", pathMatch: "full"},
      {
        path: "gallery",
        loadChildren: () => import("./gallery/gallery.module").then(m => m.GalleryModule)
      },
      {
        path: "modeler",
        loadChildren: () => import("./modeler/modeler.module").then(m => m.ModelerModule)
      }
    ]
  },
  {
    path: "forbidden",
    component: AccessDeniedComponent
  },
  {
    path: "**",
    redirectTo: ""
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: "corrected" })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
