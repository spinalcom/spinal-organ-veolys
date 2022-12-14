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

import { SpinalGraphService, SpinalContext, SpinalGraph, SpinalNode } from 'spinal-env-viewer-graph-service';
import { GEO_BUILDING_TYPE, GEO_FIND_BUILDING, GEO_FLOOR_TYPE, GEO_ROOM_TYPE } from '../../constants';
import OrganConfigModel from '../../model/OrganConfigModel';
import { getApiToken } from '../../services/veolys/Auth';
import getLocauxListe from '../../services/veolys/getLocalizations';
import getBuildingInfo from '../../services/veolys/getBuildingInfo';
import IStatus from './IStatus';
import SyncRunPull from './SyncRunHandler/SyncRunPull';
import SyncRunTicketHub from './SyncRunHandler/SyncRunTicketHub';
import { join as resolvePath } from 'path';
import { MapBuilding } from './SyncRunHandler/MapBuilding';
import {  serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import axios from 'axios';
import {AxiosInstance} from 'axios';
import * as axiosRetry from 'axios-retry';
import { findOneInContext } from '../../utils/findOneInContext';






export default class SyncRun implements IStatus {
  graph: SpinalGraph<any>;
  config: OrganConfigModel;
  syncRunPull: SyncRunPull;
  syncRunHub: SyncRunTicketHub;
  axiosClient: AxiosInstance;
  clientBuildingId : number;

  constructor(graph: SpinalGraph<any>, config: OrganConfigModel) {
    this.graph = graph;
    this.config = config;
    this.syncRunPull = new SyncRunPull(graph, config);
    this.syncRunHub = new SyncRunTicketHub(graph, config);

    let client : AxiosInstance;
    if(config.mission.plateforme.get()==='pr??-prod') {
      client = axios.create({ baseURL: 'https://uat.veolys.com' });
    }
    else {
      client = axios.create({ baseURL: 'https://nouvelatrium.net' });
    }
    // @ts-ignore
    axiosRetry(client, { retryDelay: axiosRetry.exponentialDelay });
    this.axiosClient = client;

  }

  private async getSpinalGeo(): Promise<SpinalContext<any>> {
    const contexts = await this.graph.getChildren();
    for (const context of contexts) {
      if (context.info.id.get() === this.config.spatialContextID?.get()) {
        // @ts-ignore
        SpinalGraphService._addNode(context);
        return context;
      }
    }
    const context = await this.graph.getContext('spatial');
    if (!context) throw new Error('Context Not found');
    return context;
  }

  private async getSpinalBuildingInfo(): Promise<SpinalNode> {
    const context = await this.getSpinalGeo();
    const buildings = await context.find(GEO_FIND_BUILDING, (node: SpinalNode<any>): boolean => {
      return node.getType()?.get() === GEO_BUILDING_TYPE;
    });
    return buildings[0];
  }

  /**
   * Generate token ( login ) then proceed to get veolys building information such as the list of localizations
   * 
   * @private
   * @return {*}  {Promise<MapBuilding>} a map of veolys Ids <==> spinal Ids
   * @memberof SyncRun
   */
  private async init(): Promise<MapBuilding> {
    const mapBuilding: MapBuilding = new Map;
    const spinalBuildingInfo = await this.getSpinalBuildingInfo();
    const spatialContext = await this.getSpinalGeo();
    // Purpose is to put all tickets on building (only temporary while veolysId -> spinalId are not a thing)
    const spinalId = spinalBuildingInfo?.info.id?.get() 
    const token = await getApiToken(this.config,this.axiosClient);
    const buildingInfo = await getBuildingInfo(token,this.axiosClient);
    this.clientBuildingId = buildingInfo.id;
    const locaux = await getLocauxListe(token, buildingInfo.id, this.axiosClient);

    //const locauxIds = [ 217639, 218340, 218352]
    const locauxIds = locaux.map((local) => local.id);

    console.log("Mapping spinal localizations to veolys localizations...");
    let myNodes = await spatialContext.findInContext(spatialContext, (node) => {
      // @ts-ignore
      return node.getType().get() === GEO_FLOOR_TYPE || node.getType().get() === GEO_ROOM_TYPE;
    });

    for(const myNode of myNodes) {
      const attributes = await serviceDocumentation.getAttributesByCategory(myNode, "veolys")
      for(const attribute of attributes){
          const id = locauxIds.find((id) => id == attribute.value._data);
          if(id) {
            mapBuilding.set(id,myNode.info.id.get());
          }
        }
    }

    return mapBuilding;
  }

  


  async start(): Promise<number> {
    console.log('start SyncRun');
    const map = await this.init();
    console.log("Mapping done ", map);
    await this.syncRunHub.init(this.clientBuildingId,map,this.axiosClient);
    await this.syncRunPull.init(this.clientBuildingId,map,this.axiosClient);
    await Promise.all([this.syncRunPull.run(), this.syncRunHub.run()]);
    //await Promise.all([this.syncRunHub.run()]);
    //await Promise.all([this.syncRunPull.run()]);
    return 0;
  }

  stop(): void {
    console.log('stop SyncRun');
    this.syncRunPull.stop();
    this.syncRunHub.stop();
  }
}
