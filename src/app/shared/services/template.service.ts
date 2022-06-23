import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {FhirRestfulClientService} from "../fhir/fhir-restful-client.service";
import {IBundle, IPlanDefinition} from "@ahryman40k/ts-fhir-types/lib/R4/Resource";
import {HttpClient} from "@angular/common/http";
import * as moment from "moment";

import {
  isModeledPlanDefinition,
  planDefinition2Template,
  Template,
  template2PlanDefinition
} from "../fhir/extensions/bpmn-xml-extension";
import {IBundle_Entry} from "@ahryman40k/ts-fhir-types/lib/R4/Resource/RTTI_Bundle_Entry";
import {Bpmn2fhirService} from "../fhir/bpmn2fhir.service";

@Injectable({
  providedIn: "root"
})
export class TemplateService {

  private allTemplates$: BehaviorSubject<Template[]>;

  get allTemplates(): Observable<Template[]> {
    return this.allTemplates$.asObservable();
  }

  constructor(
    private fhirClient: FhirRestfulClientService,
    private bpmn2FhirService: Bpmn2fhirService,
    private http: HttpClient
  ) {
    this.allTemplates$ = new BehaviorSubject<Template[]>([]);
  }

  queryAll() {
    this.fhirClient.getResources("PlanDefinition").subscribe(
      (bundle: IBundle) => {
        this.allTemplates$.next(
          bundle.entry ?
            bundle.entry
              .filter<IBundle_Entry>(isModeledPlanDefinition)
              .map<Template>((entry) => {
                return planDefinition2Template(entry.resource as IPlanDefinition);
              })
            : []
        );
      },
      error => {
        this.allTemplates$.error(error);
      }
    );
    return this.allTemplates;
  }

  createTemplate(template: Template): Observable<Template> {
    const createdTemplate = new Subject<Template>();
    this.http.get("assets/resources/newDiagram.bpmn", {responseType: "text"}).subscribe(bpmnXml => {
        template.bpmnXmlBase64 = btoa(unescape(encodeURIComponent(bpmnXml)));
        template.date = moment();
        const planDefinition: IPlanDefinition = template2PlanDefinition(template);
        this.fhirClient.postResource(planDefinition).subscribe(
          (next: IPlanDefinition) => {
            createdTemplate.next(planDefinition2Template(next));
            createdTemplate.complete();
          },
          error => {
            createdTemplate.error(error);
            createdTemplate.complete();
          }
        );
      },
      error => {
        createdTemplate.error(error);
        createdTemplate.complete();
      }
    );
    return createdTemplate.asObservable();
  }

  updateTemplate(template: Template): Observable<Template> {
    const updatedTemplate = new Subject<Template>();
    this.bpmn2FhirService.transformBase64BpmnXml(template.bpmnXmlBase64).subscribe(transformedPlanDefintion =>
      this.fhirClient.getResourceById("PlanDefinition", template.id).subscribe(
        result => {
          // overwrite existing with transformed
          result = Object.assign(result, transformedPlanDefintion);
          template.date = moment();
          const planDefinition = template2PlanDefinition(template, result);
          this.fhirClient.putResource(planDefinition).subscribe(
            (next: IPlanDefinition) => {
              updatedTemplate.next(planDefinition2Template(next));
              updatedTemplate.complete();
            },
            error => {
              updatedTemplate.error(error);
              updatedTemplate.complete();
            }
          );
        },
        error => {
          updatedTemplate.error(error);
          updatedTemplate.complete();
        }
      )
    );
    return updatedTemplate.asObservable();
  }

  deleteTemplate(template: Template): Observable<any> {
    const result = new Subject();
    this.fhirClient.deleteResourceById("PlanDefinition", template.id).subscribe(
      (clientResult) => {
        result.next(clientResult);
        result.complete();
      },
      error => {
        result.error(error);
        result.complete();
      }
    );
    return result.asObservable();
  }
}
