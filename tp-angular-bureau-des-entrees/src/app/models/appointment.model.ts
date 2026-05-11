/**
 * Modèle d'admission hospitalière basé sur FHIR Appointment/Encounter
 */
export type {Appointment} from 'fhir/r2';
import type {Appointment} from 'fhir/r2';

export type AdmissionType = "scheduled" | "unscheduled" | "emergency" | "transfer";
export type AdmissionStatus = "expected" | "arrived" | "hospitalized" | "discharged" | "cancelled";
export type EntryMode = "home" | "emergency" | "transfer";
export type HospitalizationType = "full" | "partial" | "ambulatory";
export type Priority = "routine" | "urgent" | "asap";

export interface Admission {
  id?: string;
  resourceType: "Appointment" | "Encounter";

  // Lien au patient (IPP ou INS)
  patientIPP: string;
  patientINS?: string;
  patientName?: string;

  // Type et statut d'admission
  admissionType: AdmissionType;
  status: AdmissionStatus;
  entryMode: EntryMode;
  hospitalizationType: HospitalizationType;
  priority: Priority;

  // Dates
  plannedAdmissionDate: string;  // Format YYYY-MM-DD
  plannedAdmissionTime?: string; // Format HH:mm
  provisionalDuration?: number;   // En jours
  actualAdmissionDate?: string;
  dischargeDate?: string;

  // Service et localisation
  serviceCode: string;           // Code PMSI du service
  serviceName: string;           // Nom du service (ex: "Cardiologie - USIC")
  departmentCode?: string;
  roomNumber?: string;
  bedNumber?: string;

  // Personnel médical
  responsiblePhysician?: {
    name: string;
    rpps?: string;  // Numéro RPPS
    speciality?: string;
  };
  preferredPhysician?: {
    name: string;
    rpps?: string;
  };
  referringPhysician?: {
    name: string;
    rpps?: string;
  };

  // Motif d'admission
  reasonOfAdmission: string;     // Code CIM-10 (ex: "I25.1")
  reasonDisplay?: string;        // Description (ex: "Cardiomyopathie ischémique chronique")
  freeDescription?: string;      // Description libre

  // Mode de financement (simplifié)
  fundingMode?: "AMO" | "AMC" | "Private";

  // Documents joints
  attachments?: {
    name: string;
    type: string;  // MIME type
    url?: string;
  }[];

  // Champs pour la conformité FHIR
  created?: string;
  modified?: string;
}

export interface AppointmentResponse {
  resource: Appointment;
  status: number;
}
