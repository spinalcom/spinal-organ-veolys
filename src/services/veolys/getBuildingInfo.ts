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
//import { axiosInstance } from '../../utils/axiosInstance';
import {AxiosInstance} from 'axios';
export interface IBuildingList {
  Buildings: IBuilding[];
}

export interface IBuilding {
    id: number;
    name: string;
    latitude : number;
    longitude : number;
}



export default function getBuildingInfo(token:string,axiosClient:AxiosInstance): Promise<IBuilding> {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  return axiosClient
    .get(`/ws/buildings?limit=-1`,config)
    .then((res) => {
      return res.data.data[0];
    }).catch((error) => {
      console.log(error)
    });
}
