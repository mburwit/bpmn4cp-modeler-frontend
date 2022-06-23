import { Injectable } from '@angular/core';
import {ICodeSystem} from "@ahryman40k/ts-fhir-types/lib/R4";
import {FhirRestfulClientService} from "../../shared/fhir/fhir-restful-client.service";
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodeSystemService {

  private currentCodeSystemSubject: BehaviorSubject<ICodeSystem> = new BehaviorSubject(undefined);
  private editingConcepts: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private fhirService: FhirRestfulClientService) { }

  isEditingConcepts(): Observable<boolean> {
    return this.editingConcepts.asObservable();
  }

  setCurrentCodeSystem(codeSystem: ICodeSystem) {
    this.currentCodeSystemSubject.next(codeSystem);
  }

  currentCodeSystem(): Observable<ICodeSystem> {
    return this.currentCodeSystemSubject.asObservable();
  }

  getAll() {
    return this.fhirService.getResources("CodeSystem");
  }

  delete(id: string) {
    return this.fhirService.deleteResourceById("CodeSystem", id);
  }

  getById(id: string) {
    return this.fhirService.getResourceById("CodeSystem", id);
  }

  create(value: ICodeSystem) {
    return this.fhirService.postResource(value);
  }

  update(value: ICodeSystem) {
    return this.fhirService.putResource(value);
  }

  deleteConcept(codeSystem: ICodeSystem, code: string) {
    codeSystem.concept = codeSystem.concept.filter(x => x.code !== code);
    return this.update(codeSystem);
  }

  setEditingConcepts(editing: boolean) {
    this.editingConcepts.next(editing);
  }
}
