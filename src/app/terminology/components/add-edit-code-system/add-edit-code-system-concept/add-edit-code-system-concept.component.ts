import {Component, OnInit} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators
} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ICodeSystem} from "@ahryman40k/ts-fhir-types/lib/R4";
import {Concept} from '../../../model/code-system-wrapper';
import {CodeSystemService} from 'src/app/terminology/services/code-system.service';
import {ICodeSystem_Concept} from "@ahryman40k/ts-fhir-types/lib/R4/Resource/RTTI_CodeSystem_Concept";
import {faLock, faLockOpen} from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: 'app-add-edit-code-system',
    templateUrl: './add-edit-code-system-concept.component.html',
    styleUrls: ['./add-edit-code-system-concept.component.scss']
})
export class AddEditCodeSystemConceptComponent implements OnInit {

    form: FormGroup;
    code: string;
    codeSystem: ICodeSystem;
    codeSystemId: string;
    concepts: Concept[] = null;
    concept: Concept;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    routeBack: string;
    iconEnable = faLock;
    iconDisable = faLockOpen;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private codeSystemService: CodeSystemService
    ) {
        this.codeSystemService.setEditingConcepts(true);
    }

    ngOnInit(): void {
        this.code = this.route.snapshot.params['code'];
        this.isAddMode = !this.code;
        this.routeBack = this.isAddMode ? "../" : "../../";

        this.codeSystemService.currentCodeSystem()
            .subscribe(
                codeSystem => {
                    this.codeSystem = codeSystem;
                    this.concepts = this.codeSystem && this.codeSystem.concept ? this.codeSystem.concept.map(c => c as Concept) : []
                }
            );

        this.form = this.formBuilder.group({
            display: ['', Validators.required],
            code: [{value: '', disabled: true}],
        });
        this.form.setValidators((form) => this.uniqueCodeValidator()(form.get('code')));

        this.form.get("display").valueChanges.subscribe(() => {
            this.updateCode();
        })

        if (!this.isAddMode) {
            this.codeSystemService.currentCodeSystem()
                .subscribe(x => {
                    this.concept = x.concept.filter(c => c.code === this.code).map(c => c as Concept)[0];
                    this.form.patchValue(this.concept);
                });
        } else {
            this.updateCode();
        }
    }

    uniqueCodeValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.concepts === null) {
                return null;
            }
            const unique = this.concepts.find(existing => existing.code != this.code && existing.code === control.value) === undefined;
            return unique ? null : {
                code: {
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
            this.createCodeSystemConcept();
        } else {
            this.updateCodeSystemConcept();
        }
    }

    private createCodeSystemConcept() {
        if (!this.codeSystem) {
            return;
        }
        this.codeSystem.concept = this.codeSystem.concept || [];
        this.codeSystem.concept.push({...this.form.value, ...{code: this.form.get("code").value}} as ICodeSystem_Concept);
        this.codeSystem.count = this.codeSystem.concept.length;
        this.codeSystemService.setCurrentCodeSystem(this.codeSystem);
        this.router.navigate([this.routeBack], {relativeTo: this.route}).then(
            () => this.codeSystemService.setEditingConcepts(false)
        );

    }

    private updateCodeSystemConcept() {
        this.codeSystem.concept = this.codeSystem.concept.filter(c => c.code !== this.code);
        this.createCodeSystemConcept();
    }

    updateCode() {
        if (!this.isAddMode) {
            return;
        }
        const display = this.form.get("display").value;
        const value = display.replace(/ /gi, "_").toLowerCase();
        this.form.patchValue(
            {
                code: value
            }
        );
    }

    cancel() {
        this.router.navigate([this.routeBack], {relativeTo: this.route}).then(
            () => this.codeSystemService.setEditingConcepts(false)
        );
    }
}
