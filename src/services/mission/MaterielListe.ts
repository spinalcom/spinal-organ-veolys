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

interface IMaterielListRes {
  Materiels: IMaterielsItem[];
}
export interface IMaterielsItem {
  enMaCleunik: number;
  Idmat: string;
  Lib1: string;
  Lib2: string;
  Local: ILocal;
  CentreTechnique: ICentreTechnique;
  CentreFinancier: ICentreFinancier;
  ArboLibre: IArboLibre;
  Famille: IFamille;
  Gamme: IGamme;
  Planning: IPlanning;
  CodeBarre: string;
  majo: number;
  qte: number;
  selactif: number;
  datemes: string;
  pereIdMat: string;
  pereLib1: string;
  pereLib2: string;
  seletat: number;
  fonct: number;
  durvie: number;
  freqrisq: number;
  gravrisq: number;
  detecrisq: number;
  datamdec: string;
  montantAmdec: number;
  dategar: string;
  libret1: string;
  libret2: string;
  libret3: string;
  libret4: string;
  libret5: string;
  libret6: string;
  montantachat: number;
  montantpreco: number;
  dureeamort: number;
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
interface IFamille {
  chLibelle: string;
  enCleUnique: number;
}
interface IGamme {
  chLibelle: string;
  enCleUnique: number;
}
interface IPlanning {
  chLibelle: string;
  enCleUnique: number;
}

export default function MaterielListe(
  token: string,
  Local: string
): Promise<IMaterielListRes> {
  console.log('MaterielListe', Local);

  return axiosInstance
    .post('APIAlteva/MaterielListe', {
      chNumSession: token,
      chLocal: Local,
      boRecursif: false,
    })
    .then((res) => {
      return res.data;
    });
}
