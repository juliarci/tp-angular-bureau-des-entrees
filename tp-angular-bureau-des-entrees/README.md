# 🏥 Bureau des Entrées — Application de gestion des admissions hospitalières

Application web développée avec **Angular** dans le cadre d'un TP de modélisation FHIR R4.  
Elle simule le bureau des entrées d'un hôpital français et implémente les profils définis selon les standards **FRCore / HL7 France**.

---

## 📋 Contexte

Le bureau des entrées est le point d'accueil administratif d'un établissement de santé. Il est responsable de :

- L'enregistrement et la vérification de l'identité des patients
- La gestion des admissions et des séjours
- La conformité avec le cadre national d'identification des patients (**INS**)

Les données manipulées sont conformes au profil `BureauEntreesPatientProfile`, défini en **FSH (FHIR Shorthand)** et hérité de `fr-core-patient` (FRCore / HL7 France).

---

## ✨ Fonctionnalités

### 👤 Gestion des patients

| Fonctionnalité | Description |
|---|---|
| **Recherche patient** | Recherche par nom, prénom, date de naissance, IPP ou INS |
| **Création de patient** | Formulaire complet conforme au profil FHIR (IPP obligatoire, INS optionnel) |
| **Fiche patient** | Affichage structuré de toutes les données administratives et médicales |
| **Modification** | Mise à jour des informations avec validation FHIR |
| **Archivage** | Désactivation d'un patient sans suppression (traçabilité garantie) |

### 🏥 Admissions

| Fonctionnalité | Description |
|---|---|
| **Enregistrement d'une admission** | Association d'un patient à une date, un motif et un service |
| **Admissions du jour** | Liste des patients attendus, arrivés ou hospitalisés |
| **Gestion des statuts** | Transition : `Attendu → Arrivé → Hospitalisé → Sorti` |

### 🪪 Identité & conformité INS

| Fonctionnalité | Description |
|---|---|
| **Vérification d'identité** | Contrôle du statut INS (provisoire / qualifié) |
| **Détection de doublons** | Rapprochement par NIR ou données démographiques |
| **Alertes d'identité** | Signalement si données manquantes ou incohérentes |

### 👩‍⚕️ Médecin traitant

- Association d'un médecin traitant via une référence `fr-core-practitioner`
- Affichage en mode **display-only** (nom, spécialité, numéro RPPS)
- ⚠️ La gestion complète des praticiens est hors périmètre de ce groupe (ressources humaines)

### 📞 Personne de confiance

- Saisie du contact d'urgence (nom, lien de parenté, téléphone)
- Modification et affichage depuis la fiche patient
- Conforme au champ `contact` du profil FSH

### 📊 Tableau de bord

- Vue d'ensemble des admissions du jour par statut
- Répartition par service et par nationalité
- Alertes : identités incomplètes, admissions sans médecin traitant

---

## 🗂️ Structure des données FHIR

L'application manipule des ressources **FHIR R4** conformes aux profils suivants :

```
FHIR R4 Base Patient
    └── fr-core-patient  (FRCore / HL7 France)
            └── BureauEntreesPatientProfile  (profil métier)
```

### Champs clés du profil patient

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
| `extension:nationality` | `0..1` | Nationalité (CodeableConcept, ISO 3166) |
| `generalPractitioner` | `0..1` | Référence au médecin traitant |
| `photo` | `0..0` | Interdit par le profil |

---

## 🛠️ Stack technique

| Élément | Choix |
|---|---|
| Framework | Angular 17+ (standalone components) |
| UI | Angular Material |
| State management | Services Angular + Signals |
| Backend simulé | Données mock en mémoire (JSON statique) |
| Format des données | Ressources FHIR R4 (JSON) |
| Styles | SCSS + thème Angular Material personnalisé |

---

## 🚀 Lancer le projet

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
ng serve

# Accéder à l'application
http://localhost:4200
```

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── core/                  # Services globaux, guards, intercepteurs
│   │   ├── services/
│   │   │   ├── patient.service.ts
│   │   │   └── admission.service.ts
│   │   └── models/
│   │       ├── patient.model.ts       # Mapping du profil FHIR
│   │       └── admission.model.ts
│   ├── features/
│   │   ├── dashboard/         # Tableau de bord
│   │   ├── patients/          # Recherche, fiche, formulaire patient
│   │   └── admissions/        # Gestion des admissions
│   └── shared/                # Composants réutilisables (badges, alertes...)
├── assets/
│   └── mock-data/             # Données FHIR JSON de test
└── styles/                    # Thème global et variables SCSS
```

---

## 👥 Périmètre du groupe

Ce projet couvre exclusivement les ressources du **bureau des entrées** :

- ✅ Ressource `Patient` (profil `BureauEntreesPatientProfile`)
- ✅ ValueSet `VSPaysNationalite` (nationalités ISO 3166)
- ✅ Gestion des admissions (simulation)
- ❌ Ressource `Appointment` — hors périmètre
- ❌ Ressource `Practitioner` — gérée par le groupe *Ressources Humaines*

---

## 📚 Références

- [HL7 FHIR R4 — Patient Resource](https://hl7.org/fhir/R4/patient.html)
- [FRCore — fr-core-patient](https://hl7.fr/ig/fhir/core/StructureDefinition/fr-core-patient)
- [Cadre national INS](https://esante.gouv.fr/securite/identite-nationale-de-sante)
- [ISO 3166 — Codes pays](https://www.iso.org/iso-3166-country-codes.html)
