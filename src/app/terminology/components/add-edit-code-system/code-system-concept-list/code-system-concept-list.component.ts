import {Component, OnInit} from '@angular/core';
import {first} from "rxjs/operators";
import {CodeSystem, Concept} from "../../../model/code-system-wrapper";
import {CodeSystemService} from "../../../services/code-system.service";


@Component({
    selector: 'app-code-system-concept-list',
    templateUrl: './code-system-concept-list.component.html',
    styleUrls: ['./code-system-concept-list.component.scss']
})
export class CodeSystemConceptListComponent implements OnInit {

    codeSystem: CodeSystem;
    concepts: Concept[] = null;
    filteredConcepts: Concept[] = null;

    constructor(private codeSystemService: CodeSystemService) {
    }

    private sort = (a, b) => a.display.localeCompare(b.display);

    ngOnInit(): void {
        this.codeSystemService.currentCodeSystem().subscribe(codeSystem => {
            this.codeSystem = codeSystem as CodeSystem
            this.concepts = this.codeSystem && this.codeSystem.concept ? this.codeSystem.concept.map(c => c as Concept) : [];
            this.onFilterChange();
        });
    }

    deleteConcept(code: string) {
        const concept = this.concepts.find(x => x.code === code);
        concept.isDeleting = true;

        this.codeSystemService.deleteConcept(this.codeSystem, code)
            .pipe(first())
            .subscribe(() => {
                this.concepts = this.concepts.filter(x => x.code !== code);
                this.filteredConcepts = this.filteredConcepts.filter(x => x.code !== code).sort(this.sort);
                this.codeSystem.concept = this.codeSystem.concept.filter(x => x.code !== code);
            });
    }

    onFilterChange(value?: string) {
        value = value || "";
        this.filteredConcepts = this.concepts
            .filter(c => value === "" || c.display.toLowerCase().indexOf(value.toLowerCase()) >= 0)
            .sort(this.sort);
    }
}
