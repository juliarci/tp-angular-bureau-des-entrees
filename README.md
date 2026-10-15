# Bureau des Entrées – Application de gestion des admissions hospitalières

Application web Angular développée dans le cadre d'un TP de modélisation FHIR R4.
Elle simule le bureau des entrées d'un hôpital français et manipule des ressources FHIR
conformes au profil `BureauEntreesPatientProfile`, défini en FSH et hérité de
`fr-core-patient` (FRCore / HL7 France).

## Fonctionnalités

- **Recherche de patients** par nom, identifiant (IPP) et date de naissance
- **Création d'un patient** via un formulaire en plusieurs étapes : IPP obligatoire, INS
  optionnel avec contrôle de format, noms multiples, adresses, nationalité, médecin traitant
- **Saisie d'adresse assistée** grâce à l'API Adresse (data.gouv.fr), à partir du code postal ou de la ville
- **Fiche patient** : synthèse des données administratives et historique des rendez-vous
- **Admissions du jour** : liste des rendez-vous (ressources `Appointment`), filtrée par statut
  (Attendu, Arrivé…)
- **Médecin traitant** : association d'une ressource `Practitioner`

## Modèle de données FHIR

```
FHIR R4 Patient
    └── fr-core-patient  (FRCore / HL7 France)
            └── BureauEntreesPatientProfile  (profil métier)
```

| Champ | Cardinalité | Description |
|---|---|---|
| `identifier` (IPP) | `1..1` | Identifiant permanent du patient, obligatoire |
| `identifier` (INS) | `0..1` | Identifiant national de santé, optionnel |
| `name` | `1..*` | Nom et prénom |
| `birthDate` | `1..1` | Date de naissance |
| `gender` | `1..1` | Genre administratif |
| `telecom` | `0..*` | Téléphone, email |
| `address` | `0..*` | Adresse postale |
| `contact` | `0..*` | Personne de confiance |
| `extension:nationality` | `0..1` | Nationalité (ISO 3166) |
| `generalPractitioner` | `0..1` | Référence au médecin traitant |
| `photo` | `0..0` | Interdit par le profil |

## Technologies

- **Angular 21** (composants standalone, chargement différé des pages), **TypeScript**
- **Angular Material**, formulaires réactifs
- Ressources **FHIR R4** typées (`@types/fhir`), échangées en REST avec un serveur FHIR de test
- **API Adresse** de data.gouv.fr

## Structure

```
src/app/
├── layout/      # En-tête et menu latéral
├── models/      # Modèles patient et rendez-vous (mapping FHIR)
├── pages/       # Recherche, fiche patient, nouvelle admission, admissions
└── services/    # Accès au serveur FHIR (Patient, Practitioner, Appointment) et à l'API Adresse
```

## Lancer le projet

```bash
cd tp-angular-bureau-des-entrees
npm install
ng serve
# puis ouvrir http://localhost:4200
```

## Références

- [HL7 FHIR R4 – Patient](https://hl7.org/fhir/R4/patient.html)
- [FRCore – fr-core-patient](https://hl7.fr/ig/fhir/core/StructureDefinition/fr-core-patient)
- [Cadre national INS](https://esante.gouv.fr/securite/identite-nationale-de-sante)
