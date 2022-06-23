import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CodeSystemComponent} from "./components/code-system.component";
import {CodeSystemListComponent} from "./components/code-system-list/code-system-list.component";
import {AddEditCodeSystemComponent} from "./components/add-edit-code-system/add-edit-code-system.component";
import {AddEditCodeSystemConceptComponent} from "./components/add-edit-code-system/add-edit-code-system-concept/add-edit-code-system-concept.component";
import {CodeSystemConceptListComponent} from "./components/add-edit-code-system/code-system-concept-list/code-system-concept-list.component";

const routes: Routes = [
    {
        path: "",
        component: CodeSystemComponent,
        children: [
            {path: '', component: CodeSystemListComponent},
            {path: 'add', component: AddEditCodeSystemComponent},
            {path: 'edit/:id', component: AddEditCodeSystemComponent,
                children: [
                    {path: '', component: CodeSystemConceptListComponent},
                    {path: 'add', component: AddEditCodeSystemConceptComponent},
                    {path: 'edit/:code', component: AddEditCodeSystemConceptComponent}
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TerminologyRoutingModule {
}
