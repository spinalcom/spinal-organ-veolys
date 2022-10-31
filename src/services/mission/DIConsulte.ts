/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

// // tslint:disable:max-line-length
// // DIConsulte : Consulte une liste de demande d'interventions.

// // Point d'entrée : https://www.api.alteva.eu:444/APIAlteva/DIConsulte
// // Méthode : POST

import { axiosInstance } from '../../utils/axiosInstance';

// /**
//  * ```txt
// - Demandes			: Structure retournée pour chaque DI répondant aux critères paramétrés.
// 	- enNumDI				: Numéro Mission de la demande d'intervention.
// 	- chRefInt				: Référence interne de la demande d'intervention.
// 	- chRefInt2				: Seconde référence interne de la demande d'intervention.
// 	- chObjet				: Objet de la demande d'intervention.
// 	- chAppelant			: Nom et prénom de l'appelant lié à la demande d'intervention.
// 	- chTelAppelant			: Numéro de téléphone de l'appelant.
// 	- chGSMAppelant			: Numéro de téléphone mobile de l'appelant.
// 	- chMailAppelant		: Adresse e-mail de l'appelant.
// 	- chDetailDI			: Détails de la demande d'intervention.
// 	- chSourceDI			: Source de la demande d'intervention.
// 	- chIdMat				: ID du matériel lié à la demande d'intervention.
// 	- chLibelleMateriel		: Libellé du matériel lié à la demande d'intervention.
// 	- Local					: Détails du local de la demande d'intervention.
// 		- chLibelle				: Libellé de l'élément.
// 		- enCleUnique			: Identifiant unique de l'élément.
// 	- CentreTechnique		: Détails du centre technique de la demande d'intervention.
// 		- chLibelle				: Libellé de l'élément.
// 		- enCleUnique			: Identifiant unique de l'élément.
// 	- CentreFinancier		: Détails du centre financier de la demande d'intervention.
// 		- chLibelle				: Libellé de l'élément.
// 		- enCleUnique			: Identifiant unique de l'élément.
// 	- ArboLibre				: Détails de l'arborescence libre de la demande d'intervention.
// 		- chLibelle				: Libellé de l'élément.
// 		- enCleUnique			: Identifiant unique de l'élément.
// 	- Domaine				: Détails du domaine de la demande d'intervention.
// 		- chLibelle				: Libellé de l'élément.
// 		- enCleUnique			: Identifiant unique de l'élément.
// 	- chCategorie			: Code de la catégorie liée à la demande.
// 	- chGroupeDemande		: Nom du groupe de demandes lié à la demande.
// 	- chEtat				: État actuel de la demande.
// 	- chDateHeureDemande	: Date et heure de la demande (au format JJ/MM/AAAA HH:MM).
// 	- chDateHeureEnr		: Date et heure d'enregistrement de la demande (au format JJ/MM/AAAA HH:MM).
// 	- chDateHeurePrevue		: Date et heure prévue de la demande (au format JJ/MM/AAAA HH:MM).
// 	- chDateHeureREP		: Date et heure de remise en service provisoire de la demande (au format JJ/MM/AAAA HH:MM).
// 	- chDateHeureRED		: Date et heure de remise en service définitive de la demande (au format JJ/MM/AAAA HH:MM).
// 	- Historiques			: Structure retournée pour chaque ligne d'historique.
// 		- chEtat				: État de la demande.
// 		- chDateEtat			: Date et heure de l'état spécifié dans chEtat (au format JJ/MM/AAAA HH:MM).
// 		- chAction				: Action ayant été réalisée sur cette ligne.
// 		- chDateAction			: Date et heure de l'action spécifiée dans chAction (au format JJ/MM/AAAA HH:MM).
// 		- chRemarqueAction		: Commentaire associé à l'action spécifiée dans chAction.
// 	- Intervenants			: Structure retournée pour chaque intervenant planifié sur la demande.
// 		- chInterv				: Nom et prénom de l'intervenant planifié.
// 		- enTempsMin			: Nombre de minutes prévues pour l'intervention.
// 		- chDatePlanif			: Date de début de la planification (au format JJ/MM/AAAA).
// 		- chHeurePlanif			: Heure de début de la planification (au format HH:MM).
// 		- enIDPlanif			: Identifiant de la planification, à réutiliser pour modifier ou supprimer celle-ci.
// 	- chVolumeHeures		: Nombre d'heures de travail réalisées sur tous les comptes-rendus par les intervenants (au format HH:MM).
// 	- enPriorite			: Priorité de la demande. Prend les valeurs 1 (Urgent), 2 (Normal), ou 3 (Occasionnel).
// - chErreursUnitaires : Descriptif des erreurs unitaires, si par exemple certaines des demandes souhaitées sont en erreur.
// ```

/**
 * @export
 * @interface IDemandeInterventions
 */
export interface IDemandeInterventions {
  Demandes: IDemandesItem[];
  chErreursUnitaires: string;
}

interface IPersonne {
  fullname_company: string;
  id:number;
  company: {
    id: number;
    name: string;
    logo: string;
  }
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  phone: string;
  avatar : string;
}



export interface IDemandeIntervention {
  author: IPersonne;
  maintainer : IPersonne;
  created_at : Date;
  updated_at : Date;
  equipment : string;
  sub_equipment: string;
  id: number;
  localization_buffer:string;
  corrective : boolean;
  on_call : boolean;
  reference : string;
  localization: IShortLocalization;
  reason: IReason;
  priority: IPriority;
  state : IState;
  external_user: string;
  rating: {stars : number};
  visit : string;
  contract_category : string;
  abstract_equipment : string | null;
  localization_image_x : string;
  localization_image_y : string;
  latitude : number | null;
  longitude : number | null;
  signature : string | null;
  signature_date : Date | null;
  delays_flags: {
    reaction: IStepDelay
    processing : IStepDelay
    maintenance: IStepDelay
  };
  rating_configuration :{
    hotline_request_edit_rating: boolean;
    hotline_request_need_rating: boolean;
    hotline_request_view_rating: boolean;
  };
  description : string
}

interface IIcon {
  type : string;
  unicode: string;
  primary: string | undefined;
  secondary: string | undefined;
}

interface IStepDelay {
  timeSpent: number;
  timeLimit: number;
  status: string;
  icon : IIcon;
  html : string;
  title: string;

}

interface IShortLocalization {
  id: number;
  name: string;
  latitude: number;
  longitude : number;
}



interface IReason {
  label: reason;
  icon :IIcon;
  icon_css : string;
  id : number;
  category_reason: ICategoryReason;
    
}


interface ICategoryReason {
  label: category_reason;
  id : number;
  icon :IIcon;
  icon_css : string;
};

interface IPriority {
  label: string;
  id: number;
}

interface IState {
  label: string;
  icon : IIcon;
  id : number;
  name : string;
}


export interface IDemandesItem {
  enNumDI: number;
  chRefInt: string;
  chRefInt2: string;
  chObjet: string;
  chAppelant: string;
  chTelAppelant: string;
  chGSMAppelant: string;
  chMailAppelant: string;
  chDetailDI: string;
  chSourceDI: string;
  chIdMat: string;
  chLibelleMateriel: string;
  Local: ILocal;
  CentreTechnique: ICentreTechnique;
  CentreFinancier: ICentreFinancier;
  ArboLibre: IArboLibre;
  Domaine: IDomaine;
  chCategorie: string;
  chGroupeDemande: string;
  chEtat: string;
  chDateHeureDemande: string;
  chDateHeureEnr: string;
  chDateHeurePrevue: string;
  chDateHeureREP: string;
  chDateHeureRED: string;
  Historiques: IHistoriquesItem[];
  Intervenants: IIntervenantsItem[];
  chVolumeHeures: string;
  enPriorite: number;
}

enum reason {
  "Anomalie indicateur ou voyant",
  "Bouton ou serrure hors service",
  "Bruit anormal",
  "Mauvaise mise à  niveau",
  "Demande de mise à l'arrêt du chauffage",
  "Demande de mise en service du chauffage",
  "Odeur anormale",
  "Trop chaud",
  "Trop froid",
  "Problème d'étanchéité",
  "Anomalie lecteur de badge",
  "Anomalie porte sortie de secours",
  "Anomalie revetement de sol",
  "Anomalie revetement mural",
  "Anomalie faux plafond",
  "Anomalie extincteur",
  "Anomalie interphone",
  "Anomalie bloc secours",
  "Plus d'éclairage (anomalie générale)",
  "Plus de courant (anomalie générale)",
  "Intervention sur espaces verts extérieurs",
  "Création d'un badge",
  "Intervention ponctuelle de nettoyage",
  "Local déchets à  nettoyer",
  "graffiti à  nettoyer",
  "Fuite",
  "_Autre",
  "Barrière automatique bloquée fermée",
  "Barrière automatique bloquée ouverte",
  "Portail bloqué fermé",
  "Portail bloqué ouvert",
  "Anomalie fenetre",
  "Anomalie ferme porte",
  "Anomalie porte",
  "Anomalie serrure",
  "Anomalie store",
  "Anomalie caméra",
  "Anomalie nettoyage sol",
  "Anomalie propreté escaliers",
  "Vitrage cassé",
  "Désactivation d'un badge",
  "Défaut éclairage",
  "Evacuation de déchets",
  "Equipement hors service",
  "Equipement bouché",
  "Demande d'intervention déneigement",
  "Anomalie éclairage extérieur",
  "Disjonction",
  "Demande de mise à l'arrêt de la climatisation",
  "Demande de mise en service de la climatisation",
  "Modification badge",
  "Anomalie télécommande",
  "Alarme - Intrusion",
  "Anomalie nettoyage sanitaires",
  "Anomalie fonctionnement",
  "Porte garage bloquée ouverte",
  "Porte garage bloquée fermée",
  "Sas entrée principale bloqué fermé",
  "Sas entrée principale bloqué ouvert",
  "avaloirs bouchés",
  "Anomalie douche",
  "Anomalie porte automatique",
  "Anomalie déclencheur manuel",
  "Anomalie badge",
  "Colonne sèche (CS)",
  "Sirène",
  "Anomalie Eau Froide Sanitaire",
  "Anomalie Eau Chaude Sanitaire",
  "Défaut porte coupe feu",
  "Demande d'enregistrement vidéo",
  "Anomalie station de recharge",
  "Mise en place protection de cabine",
  "Fuite plafond rayonnant",
  "Nettoyage ascenseur",
  "Anomalie station recharge vehicules"
}

enum category_reason{
  "_Ascenseur",
  "Escalier mécanique",
  "GPA - GBF",
  "Climatisation chauffage",
  "Clos / Couvert ",
  "Contrôle d'accès - Intrusion",
  "Décoration / Second Oeuvre",
  "Détection - Extinction incendie",
  "Electricité",
  "Espaces verts",
  "Gestion des badges",
  "Plomberie",
  "Portes automatiques",
  "Porte / Fenêtre / Store",
  "Vidéo surveillance",
  "Nettoyage",
  "Portique",
  "Salage / Déneigement"
}






interface ILocal {
  chLibelle: string;
  enCleUnique: number;
}
interface ICentreTechnique {
  chLibelle: string;
  enCleUnique: number;
}
interface ICentreFinancier {
  chLibelle: string;
  enCleUnique: number;
}
interface IArboLibre {
  chLibelle: string;
  enCleUnique: number;
}
interface IDomaine {
  chLibelle: string;
  enCleUnique: number;
}
interface IHistoriquesItem {
  chEtat: string;
  chDateEtat: string;
  chAction: string;
  chDateAction: string;
  chRemarqueAction: string;
}
interface IIntervenantsItem {
  chInterv: string;
  chDatePlanif: string;
  chHeurePlanif: string;
  enTempsMin: number;
  enIDPlanif: number;
}

/**
 * @export
 * @interface IObjDIConsulte
 */
export interface IObjDIConsulte {
  chNumSession: string;
  taNumDI?: any[];
  chLastUpdate?: string;
  enSourceDI?: number;
}
export enum SourceDIFilter {
  'Toutes les sources',
  'Saisie via Mission',
  'Reçue par e-mail',
  'Reçue via Internet',
  'Reçue par téléphone',
  'Reçue par PocketPC',
  'Reçue par Webservice',
  'Import logiciel tiers',
  'Reçue via Mission One',
}

/**
 * DIConsulte : Consulte une liste de demande d'interventions.
 * Point d'entrée : https://www.api.alteva.eu:444/APIAlteva/DIConsulte
 * Méthode : POST
 * @export
 * @param {IObjDIConsulte} obj
 * @returns {Promise<IObjDIConsulteRes>}
 */
export function diConsulte(
  chNumSession: string,
  chLastUpdate?: string,
  diNum?: any[]
): Promise<IDemandeInterventions> {
  const obj: IObjDIConsulte = {
    chNumSession,
  };
  if (diNum) obj.taNumDI = diNum;
  if (chLastUpdate) obj.chLastUpdate = chLastUpdate;
  return axiosInstance
    .post('APIAlteva/DIConsulte', obj)
    .then((res) => res.data);
}

export default function getDIs(
  token : string,
  lastUpdate: string,
){
  return axiosInstance
    .post('APIAlteva/DIConsulte', "obj")
    .then((res) => res.data);
}

export { getDIs };
