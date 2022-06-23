import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CodeSystemListComponent} from './components/code-system-list/code-system-list.component';
import {SharedModule} from "../shared/shared.module";
import {TerminologyRoutingModule} from './terminology.routing.module';
import {CodeSystemComponent} from './components/code-system.component';
import {AddEditCodeSystemComponent} from './components/add-edit-code-system/add-edit-code-system.component';
import {CodeSystemConceptListComponent} from "./components/add-edit-code-system/code-system-concept-list/code-system-concept-list.component";
import {AddEditCodeSystemConceptComponent} from "./components/add-edit-code-system/add-edit-code-system-concept/add-edit-code-system-concept.component";
import { ApplyTerminologyComponent } from './components/apply-terminology/apply-terminology.component';

@NgModule({
    declarations: [
        CodeSystemListComponent,
        CodeSystemComponent,
        AddEditCodeSystemComponent,
        CodeSystemConceptListComponent,
        AddEditCodeSystemConceptComponent,
        ApplyTerminologyComponent
    ],
    imports: [
        CommonModule,
        TerminologyRoutingModule,
        SharedModule
    ]
})
export class TerminologyModule {
}
