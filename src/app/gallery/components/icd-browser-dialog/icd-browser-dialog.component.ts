import {Component, OnInit} from "@angular/core";
import * as ECT from "@whoicd/icd11ect";
import {MatDialogRef} from "@angular/material/dialog";
import {environment as env} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {InjectorHolder} from "../../../app-init";

@Component({
  selector: "app-icd-browser-dialog",
  templateUrl: "./icd-browser-dialog.component.html",
  styleUrls: ["./icd-browser-dialog.component.scss"]
})
export class IcdBrowserDialogComponent implements OnInit {

  private readonly ectSettings = {
    // The API located at the URL below should be used only for software
    // development and testing. ICD content at this location might not
    //  be up to date or complete. For production, use the API located at
    // id.who.int with proper OAUTH authentication

    apiServerUrl: "https://id.who.int",
    apiSecured: true,
    autoBind: false,
  };

  private readonly ectCallbacks = {
    searchStartedFunction: () => {
      // this callback is called when searching is started.
      this.ectIsProgressing = true;
    },
    searchEndedFunction: () => {
      // this callback is called when search ends.
      this.ectIsProgressing = false;
    },
    selectedEntityFunction: (selectedEntity) => {
      // This callback is called when the user makes a selection
      // This is the best way to get what the user has chosen and use it in
      // your application
      this.dialogRef.close(selectedEntity);
    },
    getNewTokenFunction: async () => {
      // if the embedded coding tool is working with the cloud hosted ICD-API, you need to set apiSecured=true
      // In this case embedded coding tool calls this function when it needs a new token.
      // In this case you backend web application should provide updated tokens
      const http: HttpClient = InjectorHolder.angularInjector.get(HttpClient);
      const url = env.config.icdapi.entryPoint; // we assume this backend script returns a JSON {'token': '...'}
      try {
        const response = await http.get<{ access_token: any }>(url).toPromise();
        // const response = await fetch(url);
        // const result = await response.json();
        return response.access_token; // the function return is required
      } catch (e) {
        console.log("Error during the request");
      }
    }
  };

  ectIsProgressing = false;

  constructor(
    public dialogRef: MatDialogRef<IcdBrowserDialogComponent>
  ) {
  }

  ngOnInit() {
    ECT.Handler.configure(this.ectSettings, this.ectCallbacks);
    ECT.Handler.bind("1");
  }
}


