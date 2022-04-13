import {IExtension} from "@ahryman40k/ts-fhir-types/lib/R4/Resource/RTTI_Extension";
import {IPlanDefinition, IUsageContext, PlanDefinitionStatusKind} from "@ahryman40k/ts-fhir-types/lib/R4/Resource";
import {IBundle_Entry} from "@ahryman40k/ts-fhir-types/lib/R4/Resource/RTTI_Bundle_Entry";
import * as moment from "moment";
import {Moment} from "moment";

const resourceType = "PlanDefinition";
const extensionUrlXml = "http://www.helict.de/fhir/StructureDefinition/Extension/BpmnXml";
const extensionUrlSvg = "http://www.helict.de/fhir/StructureDefinition/Extension/BpmnSvg";
const contentTypeBpmn = "application/xml";
const contentTypeSvg = "image/svg+xml";

interface BpmnXmlExtension extends IExtension {
}

interface BpmnSvgExtension extends IExtension {
}

interface ModeledPlanDefinition extends IPlanDefinition {
}

export function isModeledPlanDefinition(arg: IBundle_Entry): arg is ModeledPlanDefinition {
  return arg.resource !== undefined && getBpmnXmlBase64(arg.resource as IPlanDefinition) !== undefined;
}

export class Topic {
  text: string;
}

export class IcdItem {
  code: string;
  title: string;
}

export class Template {

  id: any;
  description: string;
  title: string;
  usage: string;
  topic: Topic[];
  status: string;
  bpmnXmlBase64: string;
  svgBase64: string;
  useContext: IcdItem[];
  date: Moment;
  name: string;

  constructor(id?: any, title?: string, name?: string, description?: string, bpmnXmlBase64?: any, svgBase64?: any) {
    this.id = id;
    this.title = title;
    this.name = name || "";
    this.description = description;
    this.bpmnXmlBase64 = bpmnXmlBase64;
    this.svgBase64 = svgBase64;
    this.status = "draft";
  }

  static isSubTemplate(template: Template) {
    return template.name ? template.name.startsWith("_SUB_") : false;
  }

  static setIsSubTemplate(template: Template, checked: boolean) {
    let name = template.name || "";
    // remove existing prefix
    if (name.startsWith("_TOP_") || name.startsWith("_SUB_")) {
      name = name.substr(5);
    }
    // set prefix depending on checked
    template.name = checked ? "_SUB_".concat(name) : "_TOP_".concat(name);
  }
}

export function template2PlanDefinition(template: Template, planDefinition?: IPlanDefinition): ModeledPlanDefinition {
  planDefinition = planDefinition || {resourceType};
  planDefinition.title = template.title;
  planDefinition.name = template.name;
  planDefinition.description = template.description;
  planDefinition.usage = template.usage;
  planDefinition.topic = template.topic;
  planDefinition.status = PlanDefinitionStatusKind["_" + template.status];
  planDefinition.date = template.date ? template.date.format() : undefined;
  planDefinition.useContext = (template.useContext) ? [{
    code: {
      system: "http://terminology.hl7.org/CodeSystem/usage-context-type",
      code: "focus"
    },
    valueCodeableConcept: {
      coding: template.useContext.map((icdItem) => {
        return {
          system: "http://hl7.org/fhir/sid/icd-11",
          code: icdItem.code,
          display: icdItem.title
        };
      })
    }
  }] : undefined;
  planDefinition.extension = allOtherExtensions(planDefinition).concat(bpmnXmlExtension(template)).concat(bpmnSvgExtension(template));
  return planDefinition;
}

export function planDefinition2Template(planDefinition: IPlanDefinition) {
  const result: Template = new Template(
    planDefinition.id,
    planDefinition.title,
    planDefinition.name,
    planDefinition.description,
    getBpmnXmlBase64(planDefinition),
    getBpmnSvgBase64(planDefinition)
  );
  result.usage = planDefinition.usage;
  result.topic = planDefinition.topic?.map(topic => {
    return {text: topic.text};
  });
  result.status = planDefinition.status ? planDefinition.status : "unknown";
  result.date = planDefinition.date ? moment(planDefinition.date) : undefined;
  const useContext: IUsageContext[] = planDefinition.useContext?.filter((uc) => {
    return uc.code?.system === "http://terminology.hl7.org/CodeSystem/usage-context-type"
      && uc.code?.code === "focus"
      && uc.valueCodeableConcept;
  }) || [];
  if (useContext.length > 0) {
    result.useContext = useContext[0].valueCodeableConcept.coding.filter((coding) => {
      return coding.system === "http://hl7.org/fhir/sid/icd-11";
    }).map((coding => {
      return {
        code: coding.code,
        title: coding.display
      };
    }));
  }
  return result;
}

function isBpmnXmlExtension(arg: any): arg is BpmnXmlExtension {
  return arg.url === extensionUrlXml;
}

function isBpmnSvgExtension(arg: any): arg is BpmnSvgExtension {
  return arg.url === extensionUrlSvg;
}

function getBpmnXmlBase64(arg: IPlanDefinition): string {
  if (arg.extension === undefined) {
    return undefined;
  }
  const ext = arg.extension.find<BpmnXmlExtension>(isBpmnXmlExtension);
  return ext !== undefined ? ext.valueAttachment.data : undefined;
}

function getBpmnSvgBase64(arg: IPlanDefinition): string {
  if (arg.extension === undefined) {
    return undefined;
  }
  const ext = arg.extension.find<BpmnSvgExtension>(isBpmnSvgExtension);
  return ext !== undefined ? ext.valueAttachment.data : undefined;
}

function bpmnXmlExtension(template: Template): BpmnXmlExtension {
  return {
    url: extensionUrlXml,
    valueAttachment: {
      contentType: contentTypeBpmn,
      data: template.bpmnXmlBase64
    }
  };
}

function bpmnSvgExtension(template: Template): BpmnSvgExtension {
  return {
    url: extensionUrlSvg,
    valueAttachment: {
      contentType: contentTypeSvg,
      data: template.svgBase64
    }
  };
}

function allOtherExtensions(planDefinition: IPlanDefinition): IExtension[] {
  return planDefinition.extension === undefined ? [] :
    planDefinition.extension
      .filter(e => !isBpmnXmlExtension(e))
      .filter(e => !isBpmnSvgExtension(e));
}
