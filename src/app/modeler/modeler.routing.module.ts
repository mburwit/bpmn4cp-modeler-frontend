import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ModelerComponent} from "./components/modeler/modeler.component";
import {ModelerContainerComponent} from "./components/container/modeler.container.component";
import {PendingChangesGuard} from "../shared/guards/pendingchanges.guard";

const routes: Routes = [
  {
    path: "",
    component: ModelerContainerComponent,
    children: [
      {
        path: ":id",
        component: ModelerComponent,
        canDeactivate: [PendingChangesGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelerRoutingModule {
}
