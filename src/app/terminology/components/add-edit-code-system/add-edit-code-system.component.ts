import {Component, OnInit} from '@angular/core';
import {faLock, faLockOpen} from "@fortawesome/free-solid-svg-icons";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators
} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {CodeSystemService} from "../../services/code-system.service";
import {first} from "rxjs/operators";
import {ICodeSystem} from "@ahryman40k/ts-fhir-types/lib/R4";
import {CodeSystem} from "../../model/code-system-wrapper";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-add-edit-code-system',
    templateUrl: './add-edit-code-system.component.html',
    styleUrls: ['./add-edit-code-system.component.scss']
})
export class AddEditCodeSystemComponent implements OnInit {

    form: FormGroup;
    id: string;
    codeSystems: CodeSystem[] = null;
    codeSystem: CodeSystem;
    isAddMode: boolean;
    editingConcepts = false;
    loading = false;
    submitted = false;
    iconEnable = faLock;
    iconDisable = faLockOpen;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private codeSystemService: CodeSystemService,
        private snackBar: MatSnackBar
    ) {
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.codeSystemService.isEditingConcepts().subscribe(editing => {
            this.editingConcepts = editing;
        });

        this.codeSystemService.currentCodeSystem().subscribe(codeSystem => {
            this.codeSystem = codeSystem as CodeSystem;
        })

        this.codeSystemService.getAll()
            .pipe(first())
            .subscribe(codeSystems => this.codeSystems = codeSystems.entry && codeSystems.entry.map(
                    entry => entry.resource as CodeSystem
                )
            );

        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            description: [''],
            url: [{value: '', disabled: true}],
        });
        this.form.setValidators((form) => this.uniqueUrlValidator()(form.get('url')));

        this.form.get("title").valueChanges.subscribe(() => {
            this.updateUrl();
        })

        if (!this.isAddMode) {
            this.codeSystemService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.codeSystemService.setCurrentCodeSystem(x);
                    this.form.patchValue(this.codeSystem);
                });
        } else {
            this.codeSystemService.setCurrentCodeSystem({resourceType: "CodeSystem"});
            this.updateUrl();
        }
    }

    uniqueUrlValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.codeSystems) {
                return null;
            }
            const unique = this.codeSystems.find(existing => existing.id != this.id && existing.url === control.value) === undefined;
            return unique ? null : {
                url: {
                    notUnique: true
                }
            };
        };
    }

    get f() {
        return this.form.controls;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createCodeSystem();
        } else {
            this.updateCodeSystem();
        }
    }

    private createCodeSystem() {
        const codeSystem = {
            ...this.codeSystem,
            ...{
                ...this.form.value,
                ...{
                    url: this.form.get("url").value
                }
            } as CodeSystem
        };
        this.codeSystemService.create(codeSystem as ICodeSystem)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.snackBar.open("CodeSystem created!", undefined, {panelClass: "info"});
                    this.router.navigate(['../'], {relativeTo: this.route}).then();
                },
                error: error => {
                    this.snackBar.open(error.message, undefined, {panelClass: "error"});
                    this.loading = false;
                }
            });
    }

    private updateCodeSystem() {
        const codeSystem = {
            ...this.codeSystem,
            ...{
                ...this.form.value,
                ...{
                    url: this.form.get("url").value
                }
            } as CodeSystem
        };
        this.codeSystemService.update(codeSystem as ICodeSystem)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.snackBar.open("CodeSystem updated!", undefined, {panelClass: "info"});
                    this.router.navigate(['../../'], {relativeTo: this.route}).then();
                },
                error: error => {
                    this.snackBar.open(error.message, undefined, {panelClass: "error"});
                    this.loading = false;
                }
            });
    }

    updateUrl() {
        if (!this.isAddMode) {
            return;
        }
        const urlPrefix = "https://www.helict.de/fhir/CodeSystem/lux/";
        const title = this.form.get("title").value;
        const value = urlPrefix.concat(title.replace(/ /gi, "_").toLowerCase());
        this.form.patchValue(
            {
                url: value
            }
        );
    }
}
