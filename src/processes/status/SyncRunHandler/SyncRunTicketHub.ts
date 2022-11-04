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

import {
  SpinalGraph,
  SpinalGraphService,
  SpinalNode,
  SpinalNodeRef,
} from 'spinal-env-viewer-graph-service';
import OrganConfigModel from '../../../model/OrganConfigModel';
import { getApiToken } from '../../../services/veolys/Auth';
import { spinalServiceTicket } from 'spinal-service-ticket';
import { diCree, IDICree, getReasonId } from '../../../services/veolys/DICree';


import { setOrAddAttr } from '../../../utils/setOrAddAttr';
import { getTicketElems as getLocalFromTicket, getTicketLocals } from '../../../utils/getTicketLocal';
import moment = require('moment');

import { FileExplorer } from 'spinal-env-viewer-plugin-documentation-service';
import { MESSAGE_TYPES } from 'spinal-models-documentation';
import { getB64Image } from '../../../utils/getB64Image';
import { diModify } from '../../../services/mission/DIModify';
import { Lst, Ptr } from 'spinal-core-connectorjs_type';
import SpinalIO from '../../../services/SpinalIO';
import { getBuildingVeolysId, MapBuilding } from './MapBuilding';
import {AxiosInstance} from 'axios';


/**
 * Main purpose of this class is to send tickets to client platform
 *
 * @export
 * @class SyncRunTicketHub
 */
export default class SyncRunTicketHub {
  graph: SpinalGraph<any>;
  config: OrganConfigModel;
  running: boolean = false;
  mapBuilding: MapBuilding;
  axiosInstance : AxiosInstance;
  clientBuildingId : number;

  constructor(graph: SpinalGraph<any>, config: OrganConfigModel) {
    this.graph = graph;
    this.config = config;
  }

  async getContextTicket(): Promise<SpinalNode<any>> {
    const contexts = await this.graph.getChildren();
    for (const context of contexts) {
      if (context.info.id.get() === this.config.contextId.get()) {
        // @ts-ignore
        SpinalGraphService._addNode(context);
        return context;
      }
    }
    throw new Error('Context Not found');
  }

  /**
   * Goes through every process in the context and on each process iterate through every step
   * and calls updateTicketFromStep(contextId, processId, stepId)
   * @param {string} contextId
   * @return {*}  {Promise<void>}
   * @memberof SyncRunTicketHub
   */
  async updateProcess(contextId: string): Promise<void> {
    const spinalProcess = await spinalServiceTicket.getAllProcess(contextId);
    for (const process of spinalProcess) {
      const steps: SpinalNodeRef[] =
        await spinalServiceTicket.getStepsFromProcess(
          process.id.get(),
          contextId
        );
      for (const step of steps) {
        await this.updateTicketFromStep(
          contextId,
          process.id.get(),
          step.id.get()
        );
      }
    }
  }

  async updateTicketFromStep(
    contextId: string,
    processId: string,
    stepId: string
  ): Promise<void> {
    const tickets: SpinalNodeRef[] =
      await spinalServiceTicket.getTicketsFromStep(stepId);
    for (const ticket of tickets) {
      // if the ticket doesn't have a veolysId it means it has not been sent to veolys yet
      if (typeof ticket.veolysId === 'undefined') {
        await this.createTicketToVeolys(contextId, processId, stepId, ticket);
      }
    }
  }

  async getAndSendFiles(ticketRef: SpinalNodeRef): Promise<void> {
    const ticketNode = SpinalGraphService.getRealNode(ticketRef.id.get());

    const gmaoId = ticketNode.info.gmaoId?.get();
    if (gmaoId === undefined) {
      console.error('error send PJ, no gmaoID');
      return;
    }

    const files = await this.getTicketFiles(ticketNode);

    if (files.length > 0) {
      const pjs = await Promise.all(
        files.map(async (file) => {
          try {
            file._info.add_attr({ sentToGmao: true });
          } catch (e) {
            file._info.sentToGmao?.set(true);
          }
          return {
            chNomPJ: file.name.get(),
            chDataPJ: await getB64Image(file),
          };
        })
      );
      console.log('Send to Mission', {
        gmaoId,
        files: pjs.map((itm) => itm.chNomPJ),
      });
      await diModify(gmaoId, {
        chNumSession: await getApiToken(this.config,this.axiosInstance),
        PiecesJointes: pjs,
      });
    }
  }

  async getTicketFiles(ticketNode: SpinalNode<any>): Promise<any[]> {
    const dir = await FileExplorer.getDirectory(ticketNode);
    if (!dir) {
      return [];
    }
    const res = [];
    for (let idx = 0; idx < dir.length; idx += 1) {
      const file = dir[idx];
      const type = FileExplorer._getFileType(file);
      if (
        type === MESSAGE_TYPES.image &&
        file?._info?.sentToGmao?.get() !== true
      ) {
        res.push(file);
      }
    }
    return res;
  }

  async addImagesFromTickets(ticketNode: SpinalNode<any>, req: IDICree): Promise<void> {
    let imgs = null;
    if (ticketNode.info.images) {
      if (ticketNode.info.images instanceof Ptr) {
        imgs = await SpinalIO.getInstance().loadModelPtr(
          ticketNode.info.images
        );
      } else if (ticketNode.info.images instanceof Lst) {
        imgs = ticketNode.info.images;
      }
      if (imgs && imgs.length > 0) {
        const pjs: {
          chNomPJ: any;
          chDataPJ: string;
          chCommentaire?: string;
        }[] = [];
        for (let idx = 0; idx < imgs.length; idx += 1) {
          const imageObj: { name: string; value: string; comments: string } =
            imgs[idx].get();
          const resObj = {
            chNomPJ: imageObj.name,
            chDataPJ: imageObj.value,
          };
          if (imageObj.comments)
            Object.assign(resObj, { chCommentaire: imageObj.comments });
          pjs.push(resObj);
        }
        Object.assign(req, { PiecesJointes: pjs });
      }
    }
  }

  /**
   * Send ticket to mission 
   *
   * @param {string} contextId
   * @param {string} processId
   * @param {string} stepId
   * @param {SpinalNodeRef} ticketRef
   * @return {*}  {Promise<void>}
   * @memberof SyncRunTicketHub
   */
  async createTicketToVeolys(
    contextId: string,
    processId: string,
    stepId: string,
    ticketRef: SpinalNodeRef
  ): Promise<void> {
    // exemple ticket info {
    //   "name": "Test",
    //   "priority": 0,
    //   "type": "SpinalSystemServiceTicketTypeTicket",
    //   "creationDate": 1614162753244,
    //   "id": "SpinalNode-05fb7697-a0b5-a991-8d79-62f5fece09f0-177d398f6dc",
    //   "stepId": "SpinalNode-7739583d-224e-436c-d0d6-095797345d8e-174bb90159b",
    //   "color": "#ff00ff"
    // }
    const context = SpinalGraphService.getRealNode(contextId);
    const process = SpinalGraphService.getRealNode(processId);
    const step = SpinalGraphService.getRealNode(stepId);
    const ticketNode = SpinalGraphService.getRealNode(ticketRef.id.get());

    const note = ticketRef.description?.get() || '-';
    /*console.log('new ticket from hub :', {
      note,
      context: context.info.name.get(),
      process: process.info.name.get(),
      step: step.info.name.get(),
      name: ticketRef.name?.get(),
      priority: ticketRef.priority?.get(),
      //type: ticketRef.type?.get(),
      creationDate: ticketRef.creationDate?.get(),
      id: ticketRef.id?.get(),
      //stepId: ticketRef.stepId?.get(),
      //color: ticketRef.color?.get(),
    });*/

    try {
      const ticketItems = await getTicketLocals(ticketRef.id.get());
      const local = getBuildingVeolysId(ticketItems.local?.info.id.get(), this.mapBuilding)
      const date = moment(ticketRef.creationDate?.get());
      const token = await getApiToken(this.config,this.axiosInstance);
      console.log({local: local, category_reason: process.info.name.get(), motif: ticketRef.name.get()});
      const reasonId = await getReasonId(this.axiosInstance,token,local,process.info.name.get(),ticketRef.name.get());
      console.log("reasonId : ", reasonId);
      if(!reasonId) {
        console.log("Aborted : reasonId not found for ",ticketRef.name.get());
        return
      }
      let priority: number = ticketRef.priority?.get() || 0;
      switch (ticketRef.priority?.get()){
        case 0:
          priority = 2;
          break;
        case 1:
          priority = 1;
          break;
        case 2:
          priority = 3;
      }
      
      const req: IDICree = {
        author: 92940,
        localization: local,
        reason: reasonId,
        priority: priority,
        description: note
      };
      /*await this.addImagesFromTickets(ticketNode, req);
      const files = await this.getTicketFiles(ticketNode);
      if (files.length > 0) {
        const pjs = await Promise.all(
          files.map(async (file): Promise<{ chNomPJ: any; chDataPJ: string; }> => {
            try {
              file._info.add_attr({ sentToGmao: true });
            } catch (e) {
              file._info.sentToGmao?.set(true);
            }
            return {
              chNomPJ: file.name.get(),
              chDataPJ: await getB64Image(file),
            };
          })
        );
        // console.log('Send to Mission', pjs.map(itm => itm.chNomPJ));
        if (req.PiecesJointes) {
          for (const pj of pjs) {
            req.PiecesJointes.push(pj);
          }
        } else {
          Object.assign(req, { PiecesJointes: pjs });
        }
      }*/
      const di = await diCree(req, this.axiosInstance, token,this.clientBuildingId);
      console.log('di saved and recieved : ', di.id);
      // set step
      setOrAddAttr(ticketNode.info, 'veolysId', di.id);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Look for the context linked with organ ( stored in config file )
   * then calls updateProcess(contextId)
   * @return {*}  {Promise<void>}
   * @memberof SyncRunTicketHub
   */
  async updateSpinalContext(): Promise<void> {
    try {
      // 
      const context = await this.getContextTicket();
      await this.updateProcess(context.info.id.get());
    } catch (e) {
      console.error(e);
    }
  }
  
  private waitFct(nb: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(
        () => {
          resolve();
        },
        nb >= 0 ? nb : 0
      );
    });
  }


  /**
   *  Initialize class, contexts and map with the mapping recieved.
   *  Does NOT send any ticket whatsoever.
   * @param {MapBuilding} map
   * @return {*}  {Promise<void>}
   * @memberof SyncRunTicketHub
   */
  async init(clientBuildingId,map: MapBuilding, axiosInstance : AxiosInstance): Promise<void> {
    this.mapBuilding = map;
    this.axiosInstance = axiosInstance;
    this.clientBuildingId = clientBuildingId;
    const context = await this.getContextTicket();
    await context.findInContext(context, (node) => {
      // @ts-ignore
      SpinalGraphService._addNode(node);
      return false;
    });
  }

  /**
   * While running , calls updateSpinalContext every 30s 
   *
   * @return {*}  {Promise<void>}
   * @memberof SyncRunTicketHub
   */
  async run(): Promise<void> {
    this.running = true;
    // await this.initContext();
    while (true) {
      if (!this.running) break;
      const before = Date.now();
      try {
        await this.updateSpinalContext();
        console.log("J'update le context");
      } catch (e) {
        console.error(e);
      }
      const delta = Date.now() - before;
      const timeout = 30000 - delta; // 30s - delta
      await this.waitFct(timeout);
    }
  }

  stop(): void {
    this.running = false;
  }
}
