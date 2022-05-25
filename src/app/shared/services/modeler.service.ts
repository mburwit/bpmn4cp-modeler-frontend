import {Injectable} from "@angular/core";
import {BpmnModeler} from "bpmn4cp/dist/index_bundle.js";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import "svg2pdf.js";
import {PdfOptions, PdfService} from "./export/pdf/pdf.service";

@Injectable({
  providedIn: "root",
})
export class ModelerService {

  constructor(private pdfService: PdfService) {
    this.errorEvents = new Subject();
    this.currentXml$ = new BehaviorSubject("");
    this.currentSvg$ = new BehaviorSubject("");
    this.modelChanged$ = new Subject();
    this.canRedo$ = new Subject();
    this.currentZoom$ = new Subject();
  }

  get errors(): Observable<{ name: string, error: Error, data?: any }> {
    return this.errorEvents.asObservable();
  }

  get currentBpmnXml(): Observable<string> {
    return this.currentXml$.asObservable();
  }

  get currentSvg(): Observable<string> {
    return this.currentSvg$.asObservable();
  }

  get unsavedChanges(): Observable<boolean> {
    return this.modelChanged$.asObservable();
  }

  get canRedo(): Observable<boolean> {
    return this.canRedo$.asObservable();
  }

  get currentZoom(): Observable<number> {
    return this.currentZoom$.asObservable();
  }

  private bpmnModeler: BpmnModeler;

  private currentXml$: BehaviorSubject<string>;
  private currentSvg$: BehaviorSubject<string>;
  private modelChanged$: Subject<boolean>;
  private canRedo$: Subject<any>;
  private currentZoom$: Subject<number>;

  private errorEvents: Subject<{ name: string, error: Error, data?: any }>;

  static base64UriToBlob(uri: string) {
    const byteString = atob(uri.split(",")[1]);
    const mimeString = uri.split(",")[0].split(":")[1].split(";")[0];
    const buffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(buffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([buffer], {type: mimeString});
  }

  private static downloadOptions() {
    if (!navigator.msSaveOrOpenBlob && !("download" in document.createElement("a"))) {
      return {popup: window.open()};
    }
  }

  private static convertToPng(src, width, height): Promise<string> {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;
    const encoderType = "image/png";
    const encoderOptions = 0.8;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.drawImage(src, 0, 0);
    return Promise.resolve(canvas.toDataURL(encoderType, encoderOptions));
  }

  onResize() {
    if (this.bpmnModeler) {
      this.bpmnModeler.get("canvas").resized();
    }
  }

  initModeler(options: {}) {
    this.bpmnModeler = new BpmnModeler(options);
    this.bpmnModeler.on("commandStack.changed", () => {
      this.onCommandStackChanged();
    });
    this.bpmnModeler.on("canvas.viewbox.changed", () => {
      this.currentZoom$.next(this.bpmnModeler.get("canvas").zoom());
    });
  }

  async openDiagram(bpmnXml: string, modelChanged: boolean) {
    try {
      await this.bpmnModeler.importXML(bpmnXml);
      await this.updateSvg();
      await this.updateXml();
      this.modelChanged$.next(modelChanged);
    } catch (err) {
      this.errorEvents.next({
        name: "modeler.openDiagram",
        error: err
      });
    }
  }

  private onCommandStackChanged() {
    this.updateXml().then(() => {
      this.updateSvg().then(() => {
        const commandStack = this.bpmnModeler.get("commandStack");
        this.modelChanged$.next(commandStack._stackIdx >= 0);
        this.canRedo$.next(commandStack._stackIdx < commandStack._stack.length - 1);
      });
    });
  }

  private async updateSvg() {
    // update SVG
    try {
      const result = await this.bpmnModeler.saveSVG();
      const {svg} = result;
      this.currentSvg$.next(svg);
    } catch (err) {
      this.currentSvg$.error(err);
    }
  }

  private async updateXml() {
    // update XML
    try {
      const result = await this.bpmnModeler.saveXML({format: true});
      const {xml} = result;
      this.currentXml$.next(xml);
    } catch (err) {
      this.currentXml$.error(err);
    }
  }

  saved() {
    this.canRedo$.next(false);
    this.modelChanged$.next(false);
  }

  undo() {
    this.bpmnModeler.get("commandStack").undo();
  }

  redo() {
    this.bpmnModeler.get("commandStack").redo();
  }

  zoom(value: number) {
    this.bpmnModeler.get("canvas").zoom(value);
  }

  saveSvg(name: string) {
    name = name.endsWith(".svg") ? name : `${name}.svg`;
    return this.download(name, this.svgAsDataUri(), ModelerService.downloadOptions());
  }

  savePng(name: string) {
    const downloadOptions = ModelerService.downloadOptions();
    return this.pngAsDataUri().then(
      (uri) => {
        name = name.endsWith(".png") ? name : `${name}.png`;
        return this.download(name, uri, downloadOptions)
      }
    );
  }

  savePdf(name: string) {
    const pdfOptions: PdfOptions = {
      docName: name,
      modelSvg: this.currentSvg$.getValue(),
      bpmnXml: this.currentXml$.getValue()
    }
    return this.pdfService.savePdf(pdfOptions).then(blob => {
      name = name.endsWith(".pdf") ? name : `${name}.pdf`;
      return this.downloadBlob(name, blob, ModelerService.downloadOptions());
    });
  }

  saveBpmnXml(name: string) {
    name = name.endsWith(".xml") ? name : `${name}.xml`;
    return this.download(name, this.bpmnXmlAsDataUri(), ModelerService.downloadOptions());
  }

  private svgAsDataUri(): string {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(this.currentSvg$.getValue())))}`;
  }

  pngAsDataUri(base64Svg?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!base64Svg) {
        base64Svg = this.svgAsDataUri();
      }
      const image = new Image();
      image.onload = () => {
        resolve(
          ModelerService.convertToPng(
            image,
            image.width,
            image.height
          )
        );
      };
      image.onerror = () => {
        reject(`There was an error loading the data URI as an image on the following SVG\n${base64Svg}\nOpen the following link to see browser's diagnosis\n${base64Svg}`);
      };
      image.src = base64Svg;
    });
  }

  private bpmnXmlAsDataUri(): string {
    return `data:application/xml;base64,${btoa(unescape(encodeURIComponent(this.currentXml$.getValue())))}`;
  }

  private download(name: string, uri: string, options: any) {
    return this.downloadBlob(name, ModelerService.base64UriToBlob(uri), options);
  }

  private downloadBlob(name: string, blob: Blob, options: any) {
    return new Promise((resolve, reject) => {
      if (navigator.msSaveOrOpenBlob) {
        return Promise.resolve(navigator.msSaveOrOpenBlob(blob, name));
      } else {
        const saveLink = document.createElement("a");
        if ("download" in saveLink) {
          saveLink.download = name;
          saveLink.style.display = "none";
          document.body.appendChild(saveLink);
          try {
            const url = URL.createObjectURL(blob);
            saveLink.href = url;
            saveLink.onclick = () => requestAnimationFrame(() => URL.revokeObjectURL(url));
          } catch (e) {
            console.error(e);
            reject(e);
          }
          saveLink.click();
          document.body.removeChild(saveLink);
          resolve(true);
        } else if (options && options.popup) {
          try {
            const url = URL.createObjectURL(blob);
            options.popup.document.title = name;
            options.popup.location.replace(url);
            resolve(true);
          } catch (e) {
            console.error(e);
            reject(e);
          }
        }
      }
    });
  }
}
