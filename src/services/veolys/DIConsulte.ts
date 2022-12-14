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


//import { axiosInstance } from '../../utils/axiosInstance';
import {AxiosInstance} from 'axios';

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



enum reason {
  "Anomalie indicateur ou voyant"="Anomalie indicateur ou voyant",
  "Bouton ou serrure hors service"="Bouton ou serrure hors service",
  "Bruit anormal"="Bruit anormal",
  "Mauvaise mise ??  niveau"="Mauvaise mise ??  niveau",
  "Demande de mise ?? l'arr??t du chauffage"="Demande de mise ?? l'arr??t du chauffage",
  "Demande de mise en service du chauffage"="Demande de mise en service du chauffage",
  "Odeur anormale"="Odeur anormale",
  "Trop chaud"="Trop chaud",
  "Trop froid"="Trop froid",
  "Probl??me d'??tanch??it??"="Probl??me d'??tanch??it??",
  "Anomalie lecteur de badge"="Anomalie lecteur de badge",
  "Anomalie porte sortie de secours"="Anomalie porte sortie de secours",
  "Anomalie revetement de sol"="Anomalie revetement de sol",
  "Anomalie revetement mural"="Anomalie revetement mural",
  "Anomalie faux plafond"="Anomalie faux plafond",
  "Anomalie extincteur"="Anomalie extincteur",
  "Anomalie interphone"="Anomalie interphone",
  "Anomalie bloc secours"="Anomalie bloc secours",
  "Plus d'??clairage (anomalie g??n??rale)"="Plus d'??clairage (anomalie g??n??rale)",
  "Plus de courant (anomalie g??n??rale)"="Plus de courant (anomalie g??n??rale)",
  "Intervention sur espaces verts ext??rieurs"="Intervention sur espaces verts ext??rieurs",
  "Cr??ation d'un badge"="Cr??ation d'un badge",
  "Intervention ponctuelle de nettoyage"="Intervention ponctuelle de nettoyage",
  "Local d??chets ??  nettoyer"="Local d??chets ??  nettoyer",
  "graffiti ??  nettoyer"="graffiti ??  nettoyer",
  "Fuite"="Fuite",
  "_Autre"="_Autre",
  "Barri??re automatique bloqu??e ferm??e"="Barri??re automatique bloqu??e ferm??e",
  "Barri??re automatique bloqu??e ouverte"="Barri??re automatique bloqu??e ouverte",
  "Portail bloqu?? ferm??"="Portail bloqu?? ferm??",
  "Portail bloqu?? ouvert"="Portail bloqu?? ouvert",
  "Anomalie fenetre"="Anomalie fenetre",
  "Anomalie ferme porte"="Anomalie ferme porte",
  "Anomalie porte"="Anomalie porte",
  "Anomalie serrure"="Anomalie serrure",
  "Anomalie store"="Anomalie store",
  "Anomalie cam??ra"="Anomalie cam??ra",
  "Anomalie nettoyage sol"="Anomalie nettoyage sol",
  "Anomalie propret?? escaliers"="Anomalie propret?? escaliers",
  "Vitrage cass??"="Vitrage cass??",
  "D??sactivation d'un badge"="D??sactivation d'un badge",
  "D??faut ??clairage"="D??faut ??clairage",
  "Evacuation de d??chets"="Evacuation de d??chets",
  "Equipement hors service"="Equipement hors service",
  "Equipement bouch??"="Equipement bouch??",
  "Demande d'intervention d??neigement"="Demande d'intervention d??neigement",
  "Anomalie ??clairage ext??rieur"="Anomalie ??clairage ext??rieur",
  "Disjonction"="Disjonction",
  "Demande de mise ?? l'arr??t de la climatisation"="Demande de mise ?? l'arr??t de la climatisation",
  "Demande de mise en service de la climatisation"="Demande de mise en service de la climatisation",
  "Modification badge"="Modification badge",
  "Anomalie t??l??commande"="Anomalie t??l??commande",
  "Alarme - Intrusion"="Alarme - Intrusion",
  "Anomalie nettoyage sanitaires"="Anomalie nettoyage sanitaires",
  "Anomalie fonctionnement"="Anomalie fonctionnement",
  "Porte garage bloqu??e ouverte"="Porte garage bloqu??e ouverte",
  "Porte garage bloqu??e ferm??e"="Porte garage bloqu??e ferm??e",
  "Sas entr??e principale bloqu?? ferm??"="Sas entr??e principale bloqu?? ferm??",
  "Sas entr??e principale bloqu?? ouvert"="Sas entr??e principale bloqu?? ouvert",
  "avaloirs bouch??s"="avaloirs bouch??s",
  "Anomalie douche"="Anomalie douche",
  "Anomalie porte automatique"="Anomalie porte automatique",
  "Anomalie d??clencheur manuel"="Anomalie d??clencheur manuel",
  "Anomalie badge"="Anomalie badge",
  "Colonne s??che (CS)"="Colonne s??che (CS)",
  "Sir??ne"="Sir??ne",
  "Anomalie Eau Froide Sanitaire"="Anomalie Eau Froide Sanitaire",
  "Anomalie Eau Chaude Sanitaire"="Anomalie Eau Chaude Sanitaire",
  "D??faut porte coupe feu"="D??faut porte coupe feu",
  "Demande d'enregistrement vid??o"="Demande d'enregistrement vid??o",
  "Anomalie station de recharge"="Anomalie station de recharge",
  "Mise en place protection de cabine"="Mise en place protection de cabine",
  "Fuite plafond rayonnant"="Fuite plafond rayonnant",
  "Nettoyage ascenseur"="Nettoyage ascenseur",
  "Anomalie station recharge vehicules"="Anomalie station recharge vehicules",
}

enum category_reason{
  "_Ascenseur"="_Ascenseur",
  "Escalier m??canique"="Escalier m??canique",
  "GPA - GBF"="GPA - GBF",
  "Climatisation chauffage"="Climatisation chauffage",
  "Clos / Couvert"="Clos / Couvert",
  "Contr??le d'acc??s - Intrusion"="Contr??le d'acc??s - Intrusion",
  "D??coration / Second Oeuvre"="D??coration / Second Oeuvre",
  "D??tection - Extinction incendie"="D??tection - Extinction incendie",
  "Electricit??"="Electricit??",
  "Espaces verts"="Espaces verts",
  "Gestion des badges"="Gestion des badges",
  "Plomberie"="Plomberie",
  "Portes automatiques"="Portes automatiques",
  "Porte / Fen??tre / Store"="Porte / Fen??tre / Store",
  "Vid??o surveillance"="Vid??o surveillance",
  "Nettoyage"="Nettoyage",
  "Portique"="Portique",
  "Salage / D??neigement"="Salage / D??neigement",
  "Interphonie" = "Interphonie",
  "Alarme - Intrusion"="Alarme - Intrusion",
}

/**
 * DIConsulte : Consulte une liste de demande d'interventions.
 * M??thode : POST
 * @export
 * @param {IObjDIConsulte} obj
 * @returns {Promise<IObjDIConsulteRes>}
 */

export default function getDIs(
  axiosInstance : AxiosInstance,
  token : string,
  buildingId: number,
  lastUpdate: string,
) : Promise<IDemandeIntervention[]> {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  return axiosInstance
    .get(`/ws/${buildingId}/hotlinerequests?limit=-1`,config)
    .then((res) => res.data.data);
}

export { getDIs };
