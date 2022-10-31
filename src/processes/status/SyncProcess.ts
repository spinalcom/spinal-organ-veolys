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
  SpinalContext,
  SpinalGraph,
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import OrganConfigModel from '../../model/OrganConfigModel';
import { getApiToken } from '../../services/mission/AuthMission';
import getDomaineListe from '../../services/mission/getDomaineListe';
import getDomaineObjects from '../../services/mission/getDomaineObjects';
import SpinalIO from '../../services/SpinalIO';
import IStatus from './IStatus';
import { spinalServiceTicket } from 'spinal-service-ticket';
interface Domaine {
  name: string;
  gmaoId: number;
  objets: string[];
}
interface StepModel extends spinal.Model {
  name: spinal.Str;
  color: spinal.Str;
  order: spinal.Val;
}
export default class SyncProcess implements IStatus {
  graph: SpinalGraph<any>;
  config: OrganConfigModel;

  constructor(graph: SpinalGraph<any>, config: OrganConfigModel) {
    this.graph = graph;
    this.config = config;
  }

  async getMissionDomaines() {
    const token = await getApiToken(this.config);
    const [domaines, domaineObjects] = await Promise.all([
      getDomaineListe(token),
      getDomaineObjects(token),
    ]);
    const res: Domaine[] = [];
    for (const domaine of domaines.Domaines) {
      if (domaine.boCacherDansDIetCRLibre === true) {
        continue;
      }
      const objets: string[] = [];
      for (const obj of domaineObjects.Objets) {
        if (obj.Domaine.enCleUnique === domaine.Domaine.enCleUnique) {
          objets.push(obj.Objet.chLibelle);
        }
      }
      const d: Domaine = {
        objets,
        name: domaine.Domaine.chLibelle,
        gmaoId: domaine.Domaine.enCleUnique,
      };
      res.push(d);
    }
    return res;
  }
  async getContext() {
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
  async updateContextSteps(context: SpinalContext<any>) {
    const stepsLst: spinal.Lst<StepModel> =
      await SpinalIO.getInstance().loadModelPtr(context.info.steps);
    if (stepsLst.length === 5) {
      function updateStep(model, name, color, order) {
        model.name.set(name);
        model.color.set(color);
        model.order.set(order);
      }
      updateStep(stepsLst[0], 'Attente de lect.avant Execution', '#0804ef', 0);
      updateStep(stepsLst[1], 'Attente de réalisation', '#d8ff00', 1);
      updateStep(stepsLst[2], 'Réalisation partielle', '#00ffff', 2);
      updateStep(stepsLst[3], 'Clôturée', '#1bff00', 3);
      updateStep(stepsLst[4], 'Refusée', '#ff0000', -2);
      return;
    }
    stepsLst.clear();
    stepsLst.push({
      name: 'Attente de lect.avant Execution',
      color: '#0804ef',
      order: 0,
    });
    stepsLst.push({
      name: 'Attente de réalisation',
      color: '#d8ff00',
      order: 1,
    });
    stepsLst.push({
      name: 'Réalisation partielle',
      color: '#00ffff',
      order: 2,
    });
    stepsLst.push({ name: 'Clôturée', color: '#1bff00', order: 3 });
    stepsLst.push({ name: 'Refusée', color: '#ff0000', order: -2 });
  }
  async updateCommonIncident(contextId: string, missionDomaines: Domaine[]) {
    const spinalProcess = await spinalServiceTicket.getAllProcess(contextId);
    for (const mDomain of missionDomaines) {
      for (const process of spinalProcess) {
        if (mDomain.name === process.name?.get()) {
          const commonIncidentsNode: any[] =
            await spinalServiceTicket.getCommonIncident(process.id.get());
          const commonIncidentsString: string[] = commonIncidentsNode.map(
            (node) => node.name.get()
          );
          for (const obj of mDomain.objets) {
            if (commonIncidentsString.includes(obj) === false) {
              await spinalServiceTicket.addCommonIncident(
                process.id.get(),
                obj
              );
            }
          }
        }
      }
    }
  }
  async updateProcess(contextId: string, missionDomaines: Domaine[]) {
    const spinalProcess = await spinalServiceTicket.getAllProcess(contextId);
    for (const mDomain of missionDomaines) {
      let found = false;
      for (const process of spinalProcess) {
        if (mDomain.name === process.name?.get()) {
          found = true;
        }
      }
      if (!found) {
        await spinalServiceTicket.createProcess(mDomain.name, contextId);
      }
    }
  }

  async updateSpinalContext(missionDomaines: Domaine[]) {
    try {
      const context = await this.getContext();
      await this.updateContextSteps(context);
      await this.updateProcess(context.info.id.get(), missionDomaines);
      await this.updateCommonIncident(context.info.id.get(), missionDomaines);
    } catch (e) {
      console.error(e);
    }
  }

  async start() {
    console.log('start SyncProcess');
    try {
      const missionDomaines = await this.getMissionDomaines();
      console.log(missionDomaines);
      await this.updateSpinalContext(missionDomaines);
      console.log('start SyncProcess done');
    } catch (error) {
      console.error(error);
    }
    return 0;
  }

  stop() {
    console.log('stop SyncProcess');
  }
}
