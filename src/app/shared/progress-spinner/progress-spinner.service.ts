import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";

@Injectable()
export class ProgressSpinnerService {

  private inProgress: Subject<boolean>;

  constructor() {
    this.inProgress = new Subject();
  }

  get isProgressing(): Observable<boolean> {
    return this.inProgress.asObservable();
  }

  setProgressing(value: boolean) {
    this.inProgress.next(value);
  }
}
