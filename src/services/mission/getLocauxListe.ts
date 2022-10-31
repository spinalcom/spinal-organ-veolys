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
import { axiosInstance } from '../../utils/axiosInstance';

export interface ILocauxListe {
  Locaux: ILocauxItem[];
}
interface ILocauxItem {
  Local: ILocal;
  CentreTechnique: ICentreTechnique;
  CentreFinancier: ICentreFinancier;
  ArboLibre: IArboLibre;
  chIdentif: string;
  chIdentifLong: string;
  enNiveau: number;
  LocalPere: ILocalPere;
  chLibreTexte1: string;
  chLibreTexte2: string;
  chLibreTexte3: string;
  chLibreTexte4: string;
  chLibreTexte5: string;
  chLibreTexte6: string;
  chLibreTexte7: string;
  chLibreTexte8: string;
  chLibreTexte9: string;
  chLibreTexte10: string;
  chCodeBarres: string;
  chRemarque: string;
  chRemarqueInterne: string;
  chAdresse1: string;
  chAdresse2: string;
  chAdresse3: string;
  chCodePostal: string;
  chVille: string;
  chPays: string;
  reLongitude: number;
  reLatitude: number;
  chTelephone: string;
  chFax: string;
  chGSM: string;
  chEMail: string;
  chNom: string;
  chPrenom: string;
  chFonction: string;
  moLongueur: number;
  moLargeur: number;
  moHauteur: number;
  moSurface1: number;
  moSurface2: number;
  moSurface3: number;
  moSurface4: number;
  moSurface5: number;
  chRevetementSol: string;
  chRevetementMural: string;
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
interface ILocalPere {
  chLibelle: string;
  enCleUnique: number;
}

export default function getLocauxListe(token: string, local: string, recursive: boolean = true): Promise<ILocauxListe> {
  return axiosInstance
    .post('APIAlteva/LocauxListe', {
      chNumSession: token,
      boRecursif: recursive,
      chLocal: local
    })
    .then((res) => {
      return res.data;
    }).catch(() => {
      return axiosInstance
        .post('APIAlteva/LocauxListe', {
          boRecursif: recursive,
          chNumSession: token
        })
        .then((res) => {
          return res.data;
        })
    });
}
