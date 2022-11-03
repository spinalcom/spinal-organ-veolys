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

// tslint:disable:max-line-length
import { AxiosInstance } from "axios";
	
// DICree : Enregistre une demande d'intervention.
export interface IDICree {
  author: number;
  localization: number;
  reason: number;
  priority:number;
  description?:string;
  firstName? : string;
  lastName?: string;
  email?: string;
  phone?: string;
  cellphone?:string;
  companyName?:string;
  equipment?:string;
  reference?:string;
  document?:string;
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
  icon? :IIcon;
  icon_css? : string;
  id : number;
  category_reason: ICategoryReason;
    
}


interface ICategoryReason {
  label: category_reason;
  id : number;
  icon? :IIcon;
  icon_css? : string;
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
  "Mauvaise mise à  niveau"="Mauvaise mise à  niveau",
  "Demande de mise à l'arrêt du chauffage"="Demande de mise à l'arrêt du chauffage",
  "Demande de mise en service du chauffage"="Demande de mise en service du chauffage",
  "Odeur anormale"="Odeur anormale",
  "Trop chaud"="Trop chaud",
  "Trop froid"="Trop froid",
  "Problème d'étanchéité"="Problème d'étanchéité",
  "Anomalie lecteur de badge"="Anomalie lecteur de badge",
  "Anomalie porte sortie de secours"="Anomalie porte sortie de secours",
  "Anomalie revetement de sol"="Anomalie revetement de sol",
  "Anomalie revetement mural"="Anomalie revetement mural",
  "Anomalie faux plafond"="Anomalie faux plafond",
  "Anomalie extincteur"="Anomalie extincteur",
  "Anomalie interphone"="Anomalie interphone",
  "Anomalie bloc secours"="Anomalie bloc secours",
  "Plus d'éclairage (anomalie générale)"="Plus d'éclairage (anomalie générale)",
  "Plus de courant (anomalie générale)"="Plus de courant (anomalie générale)",
  "Intervention sur espaces verts extérieurs"="Intervention sur espaces verts extérieurs",
  "Création d'un badge"="Création d'un badge",
  "Intervention ponctuelle de nettoyage"="Intervention ponctuelle de nettoyage",
  "Local déchets à  nettoyer"="Local déchets à  nettoyer",
  "graffiti à  nettoyer"="graffiti à  nettoyer",
  "Fuite"="Fuite",
  "_Autre"="_Autre",
  "Barrière automatique bloquée fermée"="Barrière automatique bloquée fermée",
  "Barrière automatique bloquée ouverte"="Barrière automatique bloquée ouverte",
  "Portail bloqué fermé"="Portail bloqué fermé",
  "Portail bloqué ouvert"="Portail bloqué ouvert",
  "Anomalie fenetre"="Anomalie fenetre",
  "Anomalie ferme porte"="Anomalie ferme porte",
  "Anomalie porte"="Anomalie porte",
  "Anomalie serrure"="Anomalie serrure",
  "Anomalie store"="Anomalie store",
  "Anomalie caméra"="Anomalie caméra",
  "Anomalie nettoyage sol"="Anomalie nettoyage sol",
  "Anomalie propreté escaliers"="Anomalie propreté escaliers",
  "Vitrage cassé"="Vitrage cassé",
  "Désactivation d'un badge"="Désactivation d'un badge",
  "Défaut éclairage"="Défaut éclairage",
  "Evacuation de déchets"="Evacuation de déchets",
  "Equipement hors service"="Equipement hors service",
  "Equipement bouché"="Equipement bouché",
  "Demande d'intervention déneigement"="Demande d'intervention déneigement",
  "Anomalie éclairage extérieur"="Anomalie éclairage extérieur",
  "Disjonction"="Disjonction",
  "Demande de mise à l'arrêt de la climatisation"="Demande de mise à l'arrêt de la climatisation",
  "Demande de mise en service de la climatisation"="Demande de mise en service de la climatisation",
  "Modification badge"="Modification badge",
  "Anomalie télécommande"="Anomalie télécommande",
  "Alarme - Intrusion"="Alarme - Intrusion",
  "Anomalie nettoyage sanitaires"="Anomalie nettoyage sanitaires",
  "Anomalie fonctionnement"="Anomalie fonctionnement",
  "Porte garage bloquée ouverte"="Porte garage bloquée ouverte",
  "Porte garage bloquée fermée"="Porte garage bloquée fermée",
  "Sas entrée principale bloqué fermé"="Sas entrée principale bloqué fermé",
  "Sas entrée principale bloqué ouvert"="Sas entrée principale bloqué ouvert",
  "avaloirs bouchés"="avaloirs bouchés",
  "Anomalie douche"="Anomalie douche",
  "Anomalie porte automatique"="Anomalie porte automatique",
  "Anomalie déclencheur manuel"="Anomalie déclencheur manuel",
  "Anomalie badge"="Anomalie badge",
  "Colonne sèche (CS)"="Colonne sèche (CS)",
  "Sirène"="Sirène",
  "Anomalie Eau Froide Sanitaire"="Anomalie Eau Froide Sanitaire",
  "Anomalie Eau Chaude Sanitaire"="Anomalie Eau Chaude Sanitaire",
  "Défaut porte coupe feu"="Défaut porte coupe feu",
  "Demande d'enregistrement vidéo"="Demande d'enregistrement vidéo",
  "Anomalie station de recharge"="Anomalie station de recharge",
  "Mise en place protection de cabine"="Mise en place protection de cabine",
  "Fuite plafond rayonnant"="Fuite plafond rayonnant",
  "Nettoyage ascenseur"="Nettoyage ascenseur",
  "Anomalie station recharge vehicules"="Anomalie station recharge vehicules",
}

export enum category_reason{
  "_Ascenseur"="_Ascenseur",
  "Escalier mécanique"="Escalier mécanique",
  "GPA - GBF"="GPA - GBF",
  "Climatisation chauffage"="Climatisation chauffage",
  "Clos / Couvert"="Clos / Couvert",
  "Contrôle d'accès - Intrusion"="Contrôle d'accès - Intrusion",
  "Décoration / Second Oeuvre"="Décoration / Second Oeuvre",
  "Détection - Extinction incendie"="Détection - Extinction incendie",
  "Electricité"="Electricité",
  "Espaces verts"="Espaces verts",
  "Gestion des badges"="Gestion des badges",
  "Plomberie"="Plomberie",
  "Portes automatiques"="Portes automatiques",
  "Porte / Fenêtre / Store"="Porte / Fenêtre / Store",
  "Vidéo surveillance"="Vidéo surveillance",
  "Nettoyage"="Nettoyage",
  "Portique"="Portique",
  "Salage / Déneigement"="Salage / Déneigement",
  "Interphonie" = "Interphonie",
  "Alarme - Intrusion"="Alarme - Intrusion",
}


export const CTG_REASON_ID_MAPPING = new Map<string, number>([
  ["_Ascenseur / Anomalie indicateur ou voyant", 17],
  ["_Ascenseur / Ascenseur bloqué avec occupants", 20],
  ["_Ascenseur / Ascenseur bloqué sans occupants", 21],
  ["_Ascenseur / _Autre", 22],
  ["_Ascenseur / Bouton ou serrure hors service", 23],
  ["_Ascenseur / Bruit anormal", 24],
  ["_Ascenseur / Mauvaise mise à  niveau", 29],
  ["_Ascenseur / Défaut éclairage", 951],
  ["_Ascenseur / Mise en place protection de cabine", 1731],
  ["Escalier mécanique / _Autre", 138],
  ["Escalier mécanique / Bruit anormal", 139],
  ["Escalier mécanique / Escalier à  l'arret", 141],
  ["Escalier mécanique / Anomalie indicateur ou voyant", 2472],
  ["Escalier mécanique / Bouton ou serrure hors service", 2473],
  ["Escalier mécanique / Mauvaise mise à  niveau", 2474],
  ["GPA - GBF / Plomberie", 1278],
  ["GPA - GBF / Electricité", 1279],
  ["GPA - GBF / Contrôle d'accès", 1280],
  ["GPA - GBF / SSI", 1282],
  ["GPA - GBF / Serrurerie", 1283],
  ["GPA - GBF / Second oeuvre", 1284],
  ["GPA - GBF / Chauffage", 1522],
  ["GPA - GBF / Climatisation", 1524],
  ["Climatisation chauffage / Demande de mise à l'arrêt du chauffage", 42],
  ["Climatisation chauffage / Demande de mise en service du chauffage", 43],
  ["Climatisation chauffage / Odeur anormale", 48],
  ["Climatisation chauffage / Trop chaud", 52],
  ["Climatisation chauffage / Trop froid", 54],
  ["Clos / Couvert / Problème d'étanchéité", 59],
  ["Contrôle d'accès - Intrusion / Anomalie lecteur de badge", 65],
  ["Contrôle d'accès - Intrusion / Anomalie porte sortie de secours", 66],
  ["Décoration / Second Oeuvre / Anomalie revetement de sol", 84],
  ["Décoration / Second Oeuvre / Anomalie revetement mural", 85],
  ["Décoration / Second Oeuvre / Anomalie faux plafond", 87],
  ["Détection - Extinction incendie / Anomalie extincteur", 102],
  ["Détection - Extinction incendie / Anomalie interphone", 103],
  ["Electricité / Anomalie bloc secours", 117],
  ["Electricité / Plus d'éclairage (anomalie générale)", 129],
  ["Electricité / Plus de courant (anomalie générale)", 130],
  ["Espaces verts / Intervention sur espaces verts extérieurs", 146],
  ["Gestion des badges / Création d'un badge", 151],
  ["Plomberie / Fuite", 226],
  ["Portes automatiques / _Autre", 239],
  ["Portes automatiques / Barrière automatique bloquée fermée", 240],
  ["Portes automatiques / Barrière automatique bloquée ouverte", 241],
  ["Portes automatiques / Portail bloqué fermé", 243],
  ["Portes automatiques / Portail bloqué ouvert", 244],
  ["Porte / Fenêtre / Store / Anomalie fenetre", 247],
  ["Porte / Fenêtre / Store / Anomalie ferme porte", 248],
  ["Porte / Fenêtre / Store / Anomalie porte", 250],
  ["Porte / Fenêtre / Store / Anomalie serrure", 251],
  ["Porte / Fenêtre / Store / Anomalie store", 252],
  ["Vidéo surveillance / Anomalie caméra", 273],
  ["Porte / Fenêtre / Store / Vitrage cassé", 923],
  ["Gestion des badges / Désactivation d'un badge", 949],
  ["Plomberie / Equipement hors service", 989],
  ["Plomberie / Equipement bouché", 990],
  ["Plomberie / Odeur anormale", 1030],
  ["Plomberie / Odeur anormale", 1030],
  ["Electricité / Anomalie éclairage extérieur", 1047],
  ["Electricité / Disjonction", 1188],
  ["Climatisation chauffage / Demande de mise à l'arrêt de la climatisation", 1227],
  ["Climatisation chauffage / Demande de mise en service de la climatisation", 1228],
  ["Gestion des badges / Modification badge", 1240],
  ["Climatisation chauffage / Anomalie télécommande", 1299],
  ["Alarme - Intrusion / Alarme - Intrusion", 1302],
  ["Interphonie / Anomalie fonctionnement", 1342],
  ["Portes automatiques / Porte garage bloquée ouverte", 1343],
  ["Portes automatiques / Porte garage bloquée fermée", 1344],
  ["Portes automatiques / Sas entrée principale bloqué fermé", 1345],
  ["Portes automatiques / Sas entrée principale bloqué ouvert", 1346],
  ["Espaces verts / Grille de sol / avaloirs bouchés", 1407],
  ["Plomberie / Anomalie douche", 1473],

]);


export function diCree(
  obj: IDICree,
  axiosInstance : AxiosInstance,
  token : string,
  buildingId: number): Promise<any> 
  {
  console.log('SEND DICree', obj);
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  return axiosInstance
    .post(`/ws/${buildingId}/hotlinerequests`,obj,config)
    .then((res) => res.data.data);
}

export function getCatergoryReasons(
  axiosInstance : AxiosInstance,
  token : string,
  localizationId: number): Promise<any> 
  {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  return axiosInstance
    .get(`/ws/${localizationId}/92940/categoryreasons?limit=-1`,config)
    .then((res) => {
      const data = res.data.data;
      let map = new Map<string, number>();
      data.forEach((element: any) => {
        map.set(element.label, element.id);
      });
      return map;
    });
}

export function getReasonId(
  axiosInstance : AxiosInstance,
  token : string,
  localizationId: number,
  category_reason: string,
  motif: string): Promise<any>
  {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  return axiosInstance
    .get(`/ws/${localizationId}/92940/reasons?limit=-1`,config)
    .then((res) => {
      const data = res.data.data;
      data.forEach((element: any) => {
        if(element.category_reason.label == category_reason && element.label == motif){
          return element.id;
        }
      });
      return null;
    });
}
