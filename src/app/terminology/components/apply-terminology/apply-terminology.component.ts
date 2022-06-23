import {Component, OnInit} from '@angular/core';
import {CodeSystemService} from "../../services/code-system.service";
import {ICodeSystem} from "@ahryman40k/ts-fhir-types/lib/R4";
import {first} from "rxjs/operators";
import {FhirRestfulClientService} from "../../../shared/fhir/fhir-restful-client.service";
import {IPlanDefinition} from "@ahryman40k/ts-fhir-types/lib/R4/Resource";
import {IBundle_Entry} from "@ahryman40k/ts-fhir-types/lib/R4/Resource/RTTI_Bundle_Entry";
import {
    isModeledPlanDefinition,
    planDefinition2Template,
    Template
} from "../../../shared/fhir/extensions/bpmn-xml-extension";
import * as xpath from 'xpath-ts';
import {TemplateService} from "../../../shared/services/template.service";
import {BehaviorSubject} from "rxjs";

@Component({
    selector: 'app-apply-terminology',
    templateUrl: './apply-terminology.component.html',
    styleUrls: ['./apply-terminology.component.scss']
})
export class ApplyTerminologyComponent implements OnInit {
    progress: {
        value: number;
        style: string;
        label: string;
        bgStyle: "bg-success" | "bg-info" | "bg-warning" | "bg-danger" | ""
    }
    isApplying: boolean;
    step: number;
    changes: {
        count: number;
        models: number;
    }
    modelSubjects: BehaviorSubject<boolean>[];
    processingTasks: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    constructor(private fhirRestService: FhirRestfulClientService,
                private templateService: TemplateService,
                private codeSystemService: CodeSystemService) {
    }

    ngOnInit(): void {
        this.reset()
        this.processingTasks.subscribe(runningTasks => {
            console.log("Number of processing tasks changed to " + runningTasks);
            if (this.isApplying && runningTasks === 0) {
                this.finished();
            }
        })
    }

    apply() {
        this.reset();
        this.start();
        this.stepProgress();
        this.fhirRestService.getResources("PlanDefinition").pipe(first()).subscribe(pdBundle => {
            this.codeSystemService.getAll().pipe(first()).subscribe(csBundle => {
                this.stepProgress();
                const models = pdBundle.entry?.filter<IBundle_Entry>(isModeledPlanDefinition)
                    .map<Template>(entry => planDefinition2Template(entry.resource as IPlanDefinition)) || [];
                const codeSystems = csBundle.entry?.map(e => e.resource as ICodeSystem) || [];
                this.step = 98 / Math.max(1, models.length);
                models.forEach(template => {
                    this.applyModel(template, codeSystems).then();
                });
                this.processingTasks.next(this.processingTasks.value - 1);
            })
        });
    }

    private start() {
        this.processingTasks.next(1);
        this.isApplying = true;
    }

    private async applyModel(template: Template, codeSystems: ICodeSystem[]) {
        this.processingTasks.next(this.processingTasks.value + 1);
        const bpmnxml = decodeURIComponent(escape(atob(template.bpmnXmlBase64)));
        let xmlDoc: XMLDocument;
        if (typeof window.DOMParser != "undefined") {
            xmlDoc = (new DOMParser()).parseFromString(bpmnxml, "text/xml");
        } else {
            throw new Error("No XML parser found");
        }
        let changes = 0;
        codeSystems.forEach(codeSystem => {
            codeSystem.concept?.forEach(concept => {
                const nodes = xpath.select(`//*[@codeSystem="${codeSystem.url}" and @code="${concept.code}"]`, xmlDoc);
                (nodes as Array<any>).forEach(node => {
                    if (node.getAttribute("display") !== null
                        && concept.display !== node.getAttribute("display")) {
                        changes++;
                        node.setAttribute("display", concept.display);
                    }
                    if (node.getAttribute("name") !== null
                        && concept.display !== node.getAttribute("name")) {
                        changes++;
                        node.setAttribute("name", concept.display);
                    }
                })
            })
        });
        if (changes > 0) {
            template.bpmnXmlBase64 = btoa(unescape(encodeURIComponent(
                new XMLSerializer().serializeToString(xmlDoc.documentElement)
            )));
            await this.templateService.updateTemplate(template);
            this.changes.models++;
            this.changes.count += changes;
        }
        this.stepProgress();
        this.processingTasks.next(this.processingTasks.value - 1);

    }

    private reset() {
        this.setProgress(0);
        this.isApplying = false;
        this.changes = {
            count: 0,
            models: 0
        }
        this.processingTasks.next(0);
        this.modelSubjects = [];
        this.step = 1;
    }

    private setProgress(value: number) {
        console.log("set progress to " + value);
        this.progress = {
            value: value,
            style: `width: ${value}%`,
            label: `${value}%`,
            bgStyle: this.progress?.bgStyle || ""
        }
    }

    private stepProgress() {
        this.setProgress(Math.min(Math.round(this.progress.value + this.step), 100));
    }

    private finished() {
        this.setProgress(100);
        this.progress.bgStyle = "bg-success";
        if (this.changes.count > 0) {
            this.progress.label = `Finished! Applied ${this.changes.count} change`.concat(
                this.changes.count > 1 ? `s ` : ` `, `across ${this.changes.models} model`, this.changes.models > 1 ? `s` : ``
            );
        } else {
            this.progress.label = `Finished! No changes needed!`;
        }

    }
}
