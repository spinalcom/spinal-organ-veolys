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

const data = [
  {
    api: 'Acceptation',
    label: 'Acceptation',
    order: 0,
  },
  {
    api: 'En réparation',
    label: 'En réparation',
    order: 1,
  },
  {
    api: 'Réparé',
    label: 'Réparé',
    order: 2,
  },
  {
    api: 'Terminé',
    label: 'Terminé',
    order: 3,
  },
  { 
    api: 'Gelé',
    label: 'Gelé',
    order: 4 
  },
];

export function getStepNameByApiName(apiStepName: string) {
  for (const obj of data) {
    if (obj.api === apiStepName) return obj.label;
  }
}
export function getStepNameByLabelName(labelStepName: string) {
  for (const obj of data) {
    if (obj.label === labelStepName) return obj.api;
  }
}

export function getStepOrderByApiName(apiName: string) {
  for (const obj of data) {
    if (obj.api === apiName) return obj.order;
  }
}
