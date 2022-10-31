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
import { guid } from '../../utils/guid';

export default function MaterielCree(
  token,
  Local: string,
  chLibelle: string,
  chLibreTexte: string[],
  enQuantite: number = undefined
) {
  // "chNumSession": "{{TOKEN}}",
  // "chIdMat": "my id mat",
  // "chLocal": "FRANCE/92/NANTERRE/ARCHIPEL/BatTest/RDC/2-Pièce 2",
  // "chLibelle1": "my chLibelle1",
  // "enQuantite": 43
  const idMat = `${chLibelle}-${guid()}`;
  // const chRemarque = [
  //   `IDMat : ${idMat}`,
  //   `Libelle : ${chLibelle}`,
  //   `Local : ${Local}`,
  //   `Path Mision : ${chLibreTexte[1]}`,
  //   `Path TwinOps : ${chLibreTexte[2]}`,
  // ];
  // if (enQuantite && enQuantite > 0) {
  //   chRemarque.push(`Quantite : ${enQuantite}`);
  // }

  const req = {
    chIdMat: idMat,
    chLocal: Local,
    chLibelle1: chLibelle,
    chNumSession: token,
    // chRemarque: chRemarque.join('\n'),
  };
  for (let idx = 1, idx2 = 0; idx < chLibreTexte.length || idx2 > 5; idx++) {
    if (chLibreTexte[idx]) {
      Object.assign(req, {
        [`chLibreTexte${idx2 + 1}`]: chLibreTexte[idx],
      });
      idx2++;
    }
  }

  if (enQuantite && enQuantite > 0) {
    Object.assign(req, { enQuantite });
  }
  console.log('post: APIAlteva/MaterielCree', chLibelle);
  if (process.env.MODEDEBUG) {
    console.log(req);
    return Promise.resolve();
  } else
    return axiosInstance.post('APIAlteva/MaterielCree', req).then((res) => {
      return res.data;
    });
}
