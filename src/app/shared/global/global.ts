import { Injectable } from "@angular/core";
interface JsGlobal {
  fhirApiUrl: string;
  fhirApiRequestInit: RequestInit;
}

export abstract class GlobalRef {
  abstract get nativeGlobal(): JsGlobal;
}

@Injectable()
export class BrowserGlobalRef extends GlobalRef {
  get nativeGlobal(): JsGlobal {
    return window as unknown as JsGlobal;
  }
}
