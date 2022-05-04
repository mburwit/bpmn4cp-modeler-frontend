import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {IPlanDefinition} from "@ahryman40k/ts-fhir-types/lib/R4/Resource";
import {environment as env} from "../../../environments/environment";

const endpoint = env.config.bpmn2fhir.entryPoint;
const httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/xml",
        "charset": "UTF-8"
    })
};

@Injectable({
    providedIn: "root"
})
export class Bpmn2fhirService {

    constructor(private http: HttpClient) {
    }

    transformPlainBpmnXml(bpmnXml: string): Observable<IPlanDefinition> {
        return this.http.post<IPlanDefinition>(endpoint, bpmnXml, httpOptions);
    }

    transformBase64BpmnXml(base64BpmnXml: string): Observable<IPlanDefinition> {
        return this.transformPlainBpmnXml(decodeURIComponent(escape(atob(base64BpmnXml))));
    }
}
