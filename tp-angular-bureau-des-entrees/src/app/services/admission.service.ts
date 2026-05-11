import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Admission, AdmissionStatus } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AdmissionService {
  private admissions: Admission[] = [];
  private admissionsSubject = new BehaviorSubject<Admission[]>(this.admissions);
  public admissions$ = this.admissionsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialise les données de test
   */
  private initializeMockData(): void {
    const mockData: Admission = {
      id: '001',
      resourceType: 'Encounter',
      patientIPP: '0420998122',
      patientINS: '2 93 04 75 856 123 / 18',
      patientName: 'BERNARD, Camille Sophie',
      admissionType: "scheduled",
      status: "expected",
      entryMode: 'home',
      hospitalizationType: 'full',
      priority: 'routine',
      plannedAdmissionDate: '2026-05-15',
      plannedAdmissionTime: '14:00',
      provisionalDuration: 3,
      serviceCode: 'CARDIO-USIC',
      serviceName: 'Cardiologie - USIC',
      departmentCode: '1042',
      roomNumber: '312',
      bedNumber: '312-A',
      responsiblePhysician: {
        name: 'Dr ROYER',
        rpps: '10001247309',
        speciality: 'Cardiologie'
      },
      reasonOfAdmission: 'I25.1',
      reasonDisplay: 'Cardiomyopathie ischémique chronique',
      freeDescription: 'Patient adressé par Dr LEFÈVRE pour exploration de douleurs thoraciques d\'effort. ECG d\'effort positif. À jeun depuis 22h00. Anticoagulation suspendue depuis 48h.',
      fundingMode: 'AMO',
      created: new Date().toISOString().split('T')[0],
      modified: new Date().toISOString().split('T')[0]
    };

    this.admissions = [mockData];
    this.admissionsSubject.next(this.admissions);
  }

  /**
   * Crée une nouvelle admission
   */
  createAdmission(admission: Admission): Observable<Admission> {
    return of(admission).pipe(
      delay(500),
      map(newAdmission => {
        const admissionWithId = {
          ...newAdmission,
          id: `ADM-${Date.now()}`,
          created: new Date().toISOString().split('T')[0],
          modified: new Date().toISOString().split('T')[0]
        };
        this.admissions.push(admissionWithId);
        this.admissionsSubject.next([...this.admissions]);
        console.log('Admission créée:', admissionWithId);
        return admissionWithId;
      })
    );
  }

  /**
   * Récupère toutes les admissions
   */
  getAllAdmissions(): Observable<Admission[]> {
    return of(this.admissions).pipe(delay(300));
  }

  /**
   * Récupère une admission par son ID
   */
  getAdmissionById(id: string): Observable<Admission | undefined> {
    return of(this.admissions.find(a => a.id === id)).pipe(delay(200));
  }

  /**
   * Récupère les admissions d'un patient par son IPP
   */
  getAdmissionsByPatientIPP(ipp: string): Observable<Admission[]> {
    return of(this.admissions.filter(a => a.patientIPP === ipp)).pipe(delay(300));
  }

  /**
   * Récupère les admissions d'un patient par son INS
   */
  getAdmissionsByPatientINS(ins: string): Observable<Admission[]> {
    return of(this.admissions.filter(a => a.patientINS === ins)).pipe(delay(300));
  }

  /**
   * Récupère les admissions du jour
   */
  getTodayAdmissions(): Observable<Admission[]> {
    const today = new Date().toISOString().split('T')[0];
    return of(
      this.admissions.filter(a =>
        a.plannedAdmissionDate === today ||
        (a.status === 'hospitalized' && !a.dischargeDate)
      )
    ).pipe(delay(300));
  }

  /**
   * Récupère les admissions par statut
   */
  getAdmissionsByStatus(status: AdmissionStatus): Observable<Admission[]> {
    return of(this.admissions.filter(a => a.status === status)).pipe(delay(300));
  }

  /**
   * Récupère les admissions par service
   */
  getAdmissionsByService(serviceCode: string): Observable<Admission[]> {
    return of(this.admissions.filter(a => a.serviceCode === serviceCode)).pipe(delay(300));
  }

  /**
   * Met à jour le statut d'une admission
   */
  updateAdmissionStatus(admissionId: string, newStatus: AdmissionStatus): Observable<Admission | null> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const admission = this.admissions.find(a => a.id === admissionId);
        if (!admission) {
          console.error('Admission non trouvée');
          return null;
        }

        admission.status = newStatus;
        admission.modified = new Date().toISOString().split('T')[0];

        if (newStatus === 'hospitalized' && !admission.actualAdmissionDate) {
          admission.actualAdmissionDate = new Date().toISOString().split('T')[0];
        }

        if (newStatus === 'discharged' && !admission.dischargeDate) {
          admission.dischargeDate = new Date().toISOString().split('T')[0];
        }

        this.admissionsSubject.next([...this.admissions]);
        console.log('Statut d\'admission mis à jour:', admission);
        return admission;
      })
    );
  }

  /**
   * Met à jour une admission complète
   */
  updateAdmission(admissionId: string, admissionData: Partial<Admission>): Observable<Admission | null> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const index = this.admissions.findIndex(a => a.id === admissionId);
        if (index === -1) {
          console.error('Admission non trouvée');
          return null;
        }

        const updatedAdmission = {
          ...this.admissions[index],
          ...admissionData,
          modified: new Date().toISOString().split('T')[0]
        };
        this.admissions[index] = updatedAdmission;
        this.admissionsSubject.next([...this.admissions]);
        console.log('Admission mise à jour:', updatedAdmission);
        return updatedAdmission;
      })
    );
  }

  /**
   * Annule une admission
   */
  cancelAdmission(admissionId: string): Observable<boolean> {
    return of(false).pipe(
      delay(300),
      map(() => {
        const admission = this.admissions.find(a => a.id === admissionId);
        if (!admission) {
          console.error('Admission non trouvée');
          return false;
        }

        admission.status = 'cancelled';
        admission.modified = new Date().toISOString().split('T')[0];
        this.admissionsSubject.next([...this.admissions]);
        console.log('Admission annulée:', admissionId);
        return true;
      })
    );
  }

  /**
   * Récupère les statistiques des admissions
   */
  getAdmissionStats(): Observable<{
    total: number;
    expected: number;
    arrived: number;
    hospitalized: number;
    discharged: number;
    byService: Record<string, number>;
  }> {
    return of(null).pipe(
      delay(200),
      map(() => {
        const stats: {
          total: number;
          expected: number;
          arrived: number;
          hospitalized: number;
          discharged: number;
          byService: Record<string, number>;
        } = {
          total: this.admissions.length,
          expected: this.admissions.filter(a => a.status === 'expected').length,
          arrived: this.admissions.filter(a => a.status === 'arrived').length,
          hospitalized: this.admissions.filter(a => a.status === 'hospitalized').length,
          discharged: this.admissions.filter(a => a.status === 'discharged').length,
          byService: {}
        };

        // Compter par service
        this.admissions.forEach(a => {
          const key = a.serviceName;
          if (!stats.byService[key]) {
            stats.byService[key] = 0;
          }
          stats.byService[key]++;
        });

        return stats;
      })
    );
  }

  /**
   * Détecte les admissions sans médecin traitant assigné
   */
  getUnassignedPhysicianAdmissions(): Observable<Admission[]> {
    return of(
      this.admissions.filter(a => !a.responsiblePhysician || !a.responsiblePhysician.name)
    ).pipe(delay(300));
  }

  /**
   * Récupère les admissions pour un médecin spécifique
   */
  getAdmissionsByPhysician(physicianName: string): Observable<Admission[]> {
    return of(
      this.admissions.filter(a =>
        a.responsiblePhysician?.name === physicianName ||
        a.preferredPhysician?.name === physicianName
      )
    ).pipe(delay(300));
  }

  /**
   * Ajoute un document à une admission
   */
  addAttachment(admissionId: string, attachment: { name: string; type: string; url?: string }): Observable<Admission | null> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const admission = this.admissions.find(a => a.id === admissionId);
        if (!admission) {
          console.error('Admission non trouvée');
          return null;
        }

        if (!admission.attachments) {
          admission.attachments = [];
        }

        admission.attachments.push(attachment);
        admission.modified = new Date().toISOString().split('T')[0];
        this.admissionsSubject.next([...this.admissions]);
        return admission;
      })
    );
  }

  /**
   * Exporte une admission au format FHIR JSON
   */
  exportAdmissionAsJSON(admissionId: string): Observable<string> {
    const admission = this.admissions.find(a => a.id === admissionId);
    if (!admission) {
      return of('');
    }

    return of(JSON.stringify(admission, null, 2)).pipe(delay(200));
  }

  /**
   * Récupère les lits disponibles pour un service
   */
  getAvailableBeds(serviceCode: string): Observable<string[]> {
    // Simulation: retourner quelques lits disponibles
    const occupiedBeds = this.admissions
      .filter(a => a.serviceCode === serviceCode && a.status === 'hospitalized')
      .map(a => a.bedNumber || '')
      .filter(b => b);

    const allBeds = ['Ch. 312-A', 'Ch. 312-B', 'Ch. 313-A', 'Ch. 314-A', 'Ch. 314-B'];
    const availableBeds = allBeds.filter(bed => !occupiedBeds.includes(bed));

    return of(availableBeds).pipe(delay(200));
  }
}

