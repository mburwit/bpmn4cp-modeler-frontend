import {ICodeSystem} from "@ahryman40k/ts-fhir-types/lib/R4";
import {ICodeSystem_Concept} from "@ahryman40k/ts-fhir-types/lib/R4/Resource/RTTI_CodeSystem_Concept";

export interface CodeSystem extends ICodeSystem {
    isDeleting: boolean;
}

export interface Concept extends ICodeSystem_Concept {
    isDeleting: boolean;
}