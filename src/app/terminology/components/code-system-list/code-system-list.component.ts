import {Component, OnInit} from '@angular/core';
import {first} from "rxjs/operators";
import {CodeSystemService} from "../../services/code-system.service";
import {CodeSystem} from "../../model/code-system-wrapper";


@Component({
    selector: 'app-code-system-list',
    templateUrl: './code-system-list.component.html',
    styleUrls: ['./code-system-list.component.scss']
})
export class CodeSystemListComponent implements OnInit {

    codeSystems: CodeSystem[] = null;
    filteredCodeSystems: CodeSystem[] = null;

    constructor(private codeSystemService: CodeSystemService) {
    }

    ngOnInit(): void {
        this.codeSystemService.getAll()
            .subscribe(codeSystems => {
                    this.codeSystems = codeSystems.entry && codeSystems.entry.map(
                        entry => entry.resource as CodeSystem
                    );
                    this.onFilterChange();
                }
            );
    }

    deleteCodeSystem(id: string) {
        const codeSystem = this.codeSystems.find(x => x.id === id);
        codeSystem.isDeleting = true;
        this.codeSystemService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.codeSystems = this.codeSystems.filter(x => x.id !== id)
                this.filteredCodeSystems = this.filteredCodeSystems.filter(x => x.id !== id).sort(this.sort)
            });
    }

    onFilterChange(value?: string) {
        value = value || "";
        this.filteredCodeSystems = this.codeSystems
            .filter(c => value === "" || c.title.toLowerCase().indexOf(value.toLowerCase()) >= 0)
            .sort(this.sort);
    }

    private sort = (a, b) => Intl.Collator().compare(a.title, b.title);

}
