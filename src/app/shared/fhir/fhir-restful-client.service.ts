import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {IBundle} from "@ahryman40k/ts-fhir-types/lib/R4/Resource";
import {environment as env} from "../../../environments/environment";

const endpoint = env.config.backend.entryPoint;
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
};

@Injectable({
  providedIn: "root"
})
export class FhirRestfulClientService {

  constructor(private http: HttpClient) {
  }

  getResources(resourceType: string): Observable<IBundle> {
    return this.http.get<IBundle>(endpoint + "/" + resourceType);
  }

  getResourceById(resourceType: string, id: string): Observable<any> {
    return this.http.get(endpoint + "/" + resourceType + "/" + id);
  }

  postResource(resource: any): Observable<any> {
    return this.http.post(endpoint + "/" + resource.resourceType, JSON.stringify(resource), httpOptions);
  }

  putResource(resource: any): Observable<any> {
    return this.http.put(endpoint + "/" + resource.resourceType + "/" + resource.id, JSON.stringify(resource), httpOptions);
  }

  deleteResourceById(resourceType: string, id: string): Observable<any> {
    return this.http.delete(endpoint + "/" + resourceType + "/" + id);
  }
}
