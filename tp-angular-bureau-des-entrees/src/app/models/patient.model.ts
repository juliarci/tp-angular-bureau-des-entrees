import { CodeableConcept, HumanName, ContactPoint, Address, Reference } from "fhir/r4";

// --- Enums ---

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
  Unknown = "unknown",
}

export enum NameUse {
  Official = "official",
  Usual = "usual",
  Temp = "temp",
  Nickname = "nickname",
  Anonymous = "anonymous",
  Old = "old",
  Maiden = "maiden",
}

export enum ContactPointSystem {
  Phone = "phone",
  Fax = "fax",
  Email = "email",
  Pager = "pager",
  Url = "url",
  Sms = "sms",
  Other = "other",
}

export enum ContactPointUse {
  Home = "home",
  Work = "work",
  Temp = "temp",
  Old = "old",
  Mobile = "mobile",
}

export enum Nationality {
  FR = "FR",
  US = "US",
  DE = "DE",
  IT = "IT",
  ES = "ES",
  BE = "BE",
}

export const NationalityDisplay: Record<Nationality, string> = {
  [Nationality.FR]: "Française",
  [Nationality.US]: "Américaine",
  [Nationality.DE]: "Allemande",
  [Nationality.IT]: "Italienne",
  [Nationality.ES]: "Espagnole",
  [Nationality.BE]: "Belge",
};

// --- Constantes (valeurs fixées dans le profil) ---

export const IPP_SYSTEM = "https://chu-ISIS.fr/fhir/sid/ipp";
export const INS_SYSTEM = "urn:oid:1.2.250.1.213.1.4.8";
export const IPP_TYPE_CODE = "MR";
export const INS_TYPE_CODE = "NI";
export const NATIONALITY_EXTENSION_URL =
  "https://example.org/fhir/StructureDefinition/PatientExtension";
export const NATIONALITY_CS_URL =
  "https://example.org/fhir/CodeSystem/CSAllNationalities";

// --- Types FHIR de base ---

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface PatientContact {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
}

// --- Identifiants (slicing FSH) ---

export interface IppIdentifier {
  system: typeof IPP_SYSTEM;
  value: string;
  type: CodeableConcept;
}

export interface InsIdentifier {
  system: typeof INS_SYSTEM;
  value: string;
  type: CodeableConcept;
}

// --- Extension nationalité ---

export interface NationaliteExtension {
  url: typeof NATIONALITY_EXTENSION_URL;
  valueCodeableConcept: CodeableConcept;
}

// --- Profil Patient Bureau des Entrées ---

export interface BureauEntreesPatient {
  resourceType: "Patient";

  /** IPP obligatoire (1..1), INS optionnel (0..1) */
  identifier: [IppIdentifier, ...InsIdentifier[]];

  /** 1..* MS */
  name: [HumanName, ...HumanName[]];

  /** 1..1 MS – format YYYY-MM-DD */
  birthDate: string;

  /** 1..1 MS */
  gender: Gender;

  telecom?: ContactPoint[];
  address?: Address[];

  /** Personne de confiance */
  contact?: PatientContact[];

  // photo: interdit (0..0) → absent

  extension?: NationaliteExtension[];

  /** Référence vers fr core practitioner */
  generalPractitioner?: Reference[];
}
