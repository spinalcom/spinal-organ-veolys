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

import moment = require('moment');
import {
  SpinalContext,
  SpinalGraph,
  SpinalGraphService,
  SpinalNode,
  SpinalNodeRef,
  SPINAL_RELATION_PTR_LST_TYPE
} from 'spinal-env-viewer-graph-service';
import { spinalServiceTicket } from 'spinal-service-ticket';
import {
  SPINAL_TICKET_SERVICE_STEP_RELATION_NAME,
  SPINAL_TICKET_SERVICE_STEP_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
  SPINAL_TICKET_SERVICE_PROCESS_RELATION_NAME,
  SPINAL_TICKET_SERVICE_TICKET_TYPE
} from '../../../constants';
import type OrganConfigModel from '../../../model/OrganConfigModel';
import { getApiToken } from '../../../services/veolys/Auth';
import {
  getDIs,
  IDemandeIntervention
} from '../../../services/veolys/DIConsulte';
import {
  getStepNameByApiName,
  getStepOrderByApiName,
} from '../../../services/veolys/stepMatching';
import { dateToString, stringToTimestamp } from '../../../utils/DateString';
import { findOneInContext } from '../../../utils/findOneInContext';
import { setOrAddAttr, createIfNotExist } from '../../../utils/setOrAddAttr';
import { getBuildingSpinalId, MapBuilding } from './MapBuilding';
import {AxiosInstance} from 'axios';

/**
 * Main purpose of this class is to pull tickets from client.
 *
 * @export
 * @class SyncRunPull
 */
export class SyncRunPull {
  graph: SpinalGraph<any>;
  config: OrganConfigModel;
  interval: number;
  running: boolean;
  mapBuilding: Map<number, string>;
  axiosInstance : AxiosInstance;
  clientBuildingId : number;

  constructor(graph: SpinalGraph<any>, config: OrganConfigModel) {
    this.graph = graph;
    this.config = config;
    this.running = false;
  }

  async updateSpinalContext(): Promise<IDemandeIntervention[]> {
    try {
      const context = await this.getContextTicket();
      return await this.updateProcessTicket(context.info.id.get());
    } catch (e) {
      console.error(e);
    }
  }

  async getContextTicket() {
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

  
  async updateProcessTicket(contextId: string): Promise<IDemandeIntervention[]> {
    const spinalProcess = await spinalServiceTicket.getAllProcess(contextId);
    const stepsToExclude = ['Terminé', 'Refusé', 'Archived'];
    const dis = [];


    for (const process of spinalProcess) {
      const steps: SpinalNodeRef[] =
        await spinalServiceTicket.getStepsFromProcess(
          process.id.get(),
          contextId
        );
      for (const step of steps) {
        if (stepsToExclude.includes(step.name.get())) {
          continue;
        }
        const arr = await this.updateTicketFromStep(step.id.get());
        dis.push(...arr);
      }
    }
    if (dis.length === 0) return;
    const token = await getApiToken(this.config,this.axiosInstance);
    // !! ici on doit renvoyer que les tickets qui ne sont pas dans les steps à exclure
    return getDIs(this.axiosInstance,token, this.clientBuildingId, dateToString(this.config.mission.lastSync.get()));
  }

  async updateTicketFromStep(stepId: string): Promise<any[]> {
    const tickets: SpinalNodeRef[] =
      await spinalServiceTicket.getTicketsFromStep(stepId);
    const dis = tickets.reduce((acc, ticket) => {
      const ticketNode = SpinalGraphService.getRealNode(ticket.id.get());
      if (typeof ticketNode.info.gmaoId !== 'undefined')
        acc.push(ticketNode.info.gmaoId.get());
      return acc;
    }, []);
    return dis;
  }

  async pullTickets(): Promise<IDemandeIntervention[]> {
    const token = await getApiToken(this.config,this.axiosInstance);
    const lastDI = dateToString(this.config.mission.lastSync.get());
    console.log(
      'sync from',
      lastDI,
      moment(this.config.mission.lastSync.get())
    );
    return getDIs(this.axiosInstance,token,this.clientBuildingId, lastDI);
  }


  async updateContext(demandeInters: IDemandeIntervention[]): Promise<void> {
    const context = await this.getContext();
    for (const ticket of demandeInters) {
      try {
        await this.updateTicket(ticket, context);
      } catch (e) {
        console.error(e);
      }
    }
  }

  async getProcessByStepId(stepId: string): Promise<SpinalNode<any>> {
    const stepNode = SpinalGraphService.getRealNode(stepId);
    const parents = await stepNode.getParents(
      SPINAL_TICKET_SERVICE_STEP_RELATION_NAME
    );
    return parents[0];
  }

  /**
   * Update process of the ticket if needed and return said process
   *
   * @param {SpinalNode<any>} ticketNode
   * @param {IDemandeIntervention} ticket
   * @param {SpinalContext<any>} context
   * @return {*}  {Promise<SpinalNode<any>>}
   * @memberof SyncRunPull
   */
  async updateProcess(
    ticketNode: SpinalNode<any>,
    ticket: IDemandeIntervention,
    context: SpinalContext<any>
  ): Promise<SpinalNode<any>> {
    const ticketId = ticketNode.info.id.get();
    // const processId = ticketNode.info.processId.get();

    const stepId = ticketNode.info.stepId.get();
    const processNode = await this.getProcessByStepId(stepId);
    // const processNode = SpinalGraphService.getRealNode(processId);
    if (processNode?.info.name.get() === ticket.reason.category_reason.label) {
      return processNode;
    }
    const process = await context.getChildrenInContext(context);
    for (const proc of process) {
      if (proc.info.name.get() === ticket.reason.category_reason.label) {
        await spinalServiceTicket.changeTicketProcess(
          ticketId,
          proc.info.id.get(),
          context.info.id.get()
        );
        return proc;
      }
    }
  }

  async removeErrorTicketMultipleStepParents(
    ticketNode: SpinalNode<any>
  ): Promise<void> {
    const parents = await ticketNode.getParents([
      SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
    ]);
    const stepsParents = parents.filter(
      (itm: SpinalNode<any>): boolean =>
        itm.getType().get() === SPINAL_TICKET_SERVICE_STEP_TYPE
    );
    if (stepsParents.length > 1) {
      const stepId = ticketNode.info.stepId.get();
      const proms = [];
      let found = false;
      for (const parent of stepsParents) {
        if (parent.getId().get() !== stepId) {
          proms.push(
            parent.removeChild(
              ticketNode,
              SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
              'PtrLst'
            )
          );
        } else found = true;
      }
      if (found === false) {
        // sanity check add ticket of suposed current step
        const stepNode = SpinalGraphService.getRealNode(stepId);
        proms.push(
          stepNode.addChild(
            ticketNode,
            SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
            'PtrLst'
          )
        );
      }
      await Promise.all(proms);
    }
  }

  async updateStep(
    ticketNode: SpinalNode<any>,
    ticket: IDemandeIntervention,
    context: SpinalContext<any>,
    processNode: SpinalNode<any>
  ): Promise<SpinalNode<any>> {
    await this.removeErrorTicketMultipleStepParents(ticketNode);
    const ticketId = ticketNode.info.id.get();
    const stepId = ticketNode.info.stepId.get();
    const stepNode = SpinalGraphService.getRealNode(stepId);
    const stepName = getStepNameByApiName(ticket.state.label);
    if (stepNode?.info.name.get() === stepName) {
      return stepNode;
    }
    const steps = await processNode.getChildrenInContext(context);
    for (const step of steps) {
      if (step.info.name.get() === stepName) {
        await spinalServiceTicket.moveTicket(
          ticketId,
          stepId,
          step.info.id.get(),
          context.info.id.get()
        );
        await spinalServiceTicket.addLogToTicket(
          ticketId,
          6,
          { name: ticket.maintainer?.username, userId: 0 },
          stepId,
          step.info.id.get()
        );
        return step;
      }
    }
  }

  async getDomaine(
    context: SpinalContext<any>,
    name: string
  ): Promise<SpinalNode<spinal.Model>> {
    const domaines = await context.getChildrenInContext(context);
    for (const domaine of domaines) {
      if (domaine.info.name.get() === name) return domaine;
    }
  }

  updateTicketInfo(ticket: IDemandeIntervention, ticketNode: SpinalNode<any>): void {
    setOrAddAttr(ticketNode.info, 'name', ticket.reason.label);
    setOrAddAttr(ticketNode.info, 'priority', ticket.priority.id);
  }


  async updateTicket(
    ticket: IDemandeIntervention,
    context: SpinalContext<any>
  ): Promise<void> {
    // check ticket location - ignore undef
    const locationNode = await this.getLocation(ticket);
    if (!locationNode) {
      console.log('update ticket ignored', {
        id: ticket.id,
      });
      return;
    }
    /*console.log('Handling ticket', {
      author: ticket.author.username,
      id: ticket.id,
      localizationId: ticket.localization.id,
      step: ticket.state.label,
      priority: ticket.priority.id,
      description: ticket.description
    });*/
    
    //console.log("Ticket will be attached to ",locationNode.info.id.get());
    // find in context info.gmaoId
    const tickets = await context.findInContext(
      context,
      (node) => node.info.veolysId?.get() === ticket.id
    );
    
    if (tickets.length > 0) {
      // recup et check domaine / step
      const ticketNode: SpinalNode<any> = tickets[0];
      const process = await this.updateProcess(ticketNode, ticket, context);
      if (!process)
        return console.error('Domaine Not found', ticket.reason.category_reason.label);

      await this.updateStep(ticketNode, ticket, context, process);
      this.updateTicketInfo(ticket, ticketNode);
      //console.log('ticket found', ticketNode.info.get());

    } else { // if ticket does not exist 
      
      // get the process the ticket will be created into.
      const domaine = await this.getDomaine(context, ticket.reason.category_reason.label);
      if (!domaine){
        return console.error('Domaine Not found', ticket.reason.category_reason.label);
      }

      // save ticket attributes ( infos that could be handy to have later)
      const ticketInfo = {
        veolysId: ticket.id,
        user: {id: ticket.author.id, name: ticket.author.username},
        name: ticket.reason.label,
        localization: ticket.localization.id,
        priority: ticket.priority.id,
        description: ticket.description,
        declarer_id: 'Veolys'
      };
      //create ticket
      const ticketId = await spinalServiceTicket.addTicket(
        ticketInfo,
        domaine.info.id.get(),
        context.info.id.get(),
        locationNode.info.id.get()
      );
      console.log("Saved received ticket");
      if (typeof ticketId !== 'string') return console.error(ticketId);
      // check if step if default
      const ticketNode = SpinalGraphService.getRealNode(ticketId);
      this.updateTicketInfo(ticket, ticketNode);

      if (getStepOrderByApiName(ticket.reason.label) !== 0) {
        
        // const ticketNode = SpinalGraphService.getRealNode(ticketId);
        await this.updateStep(ticketNode, ticket, context, domaine);
      }
    }
  }

  async getSpinalGeo(): Promise<SpinalContext<any>> {
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

  async getLocation(ticket: IDemandeIntervention): Promise<SpinalNode<any>> {
    // const path = ticket.Local.chLibelle;
    const LocalId = getBuildingSpinalId(ticket.localization.id, this.mapBuilding);
    const context = await this.getSpinalGeo();
    if (context) {
      return findOneInContext(
        context,
        context,
        (node: SpinalNode<any>): boolean => node.info.id.get() === LocalId
      );
    }
  }

  async getContext(): Promise<SpinalNode<any>> {
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
   * Initialize the context (fill the SpinalGraphService)
   *
   * @return {*}  {Promise<void>}
   * @memberof SyncRunPull
   */
  async initContext(): Promise<void> {
    const context = await this.getContext();
    const spinalGeo = await this.getSpinalGeo();
    await spinalGeo.findInContext(spinalGeo, (node) => {
      // @ts-ignore
      SpinalGraphService._addNode(node);
      return false;
    });
    await context.findInContext(context, (node): false => {
      // @ts-ignore
      SpinalGraphService._addNode(node);
      return false;
    });
  }

  async clearLinks(parentId, relationName, relationType) {
    let realNode = SpinalGraphService.getRealNode(parentId);
    // @ts-ignore
    SpinalGraphService._addNode(realNode);

    if (realNode.hasRelation(relationName, relationType)) {
      const children = await realNode.getChildren(relationName);
      for (var elt in children) {
        let realChildNode = children[elt];
        await realNode.removeChild(realChildNode, relationName, relationType);
      }
      await realNode.removeRelation(relationName, relationType);
    }
  }

  async clearTickets(){
    console.log("Clearing tickets...");
    const context = await this.getContext();
    const tickets = await context.findInContext(context, (node) => {
      return node.info.type.get() === SPINAL_TICKET_SERVICE_TICKET_TYPE;
    });
    console.log("tickets ",tickets.length);
    for (const ticket of tickets) {
      await ticket.removeFromGraph();
    }
    const steps = await context.findInContext(context, (node) => {
      return node.info.type.get() === SPINAL_TICKET_SERVICE_STEP_TYPE;
    });
    for (const step of steps) {
     await this.clearLinks(step.info.id.get(), SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,SPINAL_RELATION_PTR_LST_TYPE );
    }
    console.log("Clearing tickets ... DONE !")
  }

  async init(clientBuildingId,mapBuilding: MapBuilding, axiosInstance : AxiosInstance): Promise<void> {
    this.mapBuilding = mapBuilding;
    this.axiosInstance = axiosInstance;
    this.clientBuildingId = clientBuildingId;
    await this.initContext();
    
    try {

      //await this.clearTickets();
      //Get tickets from client
      let DI = await this.pullTickets();
      //DI = [DI[0]];
      //Create tickets in BOS
      await this.updateContext(DI);
      this.config.mission.lastSync.set(Date.now());
    } catch (e) {
      console.error(e);
    }
  }

  async run(): Promise<void> {
    this.running = true;
    const timeout = this.config.mission.pullInterval.get();
    await this.waitFct(timeout);
    while (true) {
      if (!this.running) break;
      const before = Date.now();
      try {

        /* !! try {
          const DI = await this.updateSpinalContext();
          await this.updateContext(DI);
        } catch (e) {
          console.error(e);
        }*/
        console.log("Pulling tickets...");
        const DI2 = await this.pullTickets();
        await this.updateContext(DI2);
        this.config.mission.lastSync.set(Date.now());
      } catch (e) {
        console.error(e);
        await this.waitFct(1000 * 60);
      } finally {
        const delta = Date.now() - before;
        const timeout = this.config.mission.pullInterval.get() - delta;
        await this.waitFct(timeout);
      }
    }
  }

  stop(): void {
    this.running = false;
  }
}
export default SyncRunPull;
