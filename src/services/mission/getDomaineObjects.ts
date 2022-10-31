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

export interface IDomaineObjetsListe {
  Objets: IObjetsItem[];
}
interface IObjetsItem {
  Objet: IObjet;
  Domaine: IDomaine;
  chCodeObjet: string;
  chRemarque: string;
  enTempsMin: number;
  chIntervenant1: string;
  chIntervenant2: string;
  chIntervenant3: string;
  enTempsMinIntervenant1: number;
  enTempsMinIntervenant2: number;
  enTempsMinIntervenant3: number;
}
interface IObjet {
  chLibelle: string;
  enCleUnique: number;
}
interface IDomaine {
  chLibelle: string;
  enCleUnique: number;
}

export default function getDomaineObjects(
  token: string
): Promise<IDomaineObjetsListe> {
  return axiosInstance
    .post('APIAlteva/ObjetsListe', { chNumSession: token })
    .then((res) => {
      return res.data;
    });
}
