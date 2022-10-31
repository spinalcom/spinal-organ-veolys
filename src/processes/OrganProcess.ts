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
import { SpinalGraph } from 'spinal-env-viewer-graph-service';
import OrganConfigModel from '../model/OrganConfigModel';
import SpinalIO from '../services/SpinalIO';
import OrganConfig from './OrganConfig';
import IStatus from './status/IStatus';
import StandBy from './status/StandBy';
import SyncProcess from './status/SyncProcess';
import SyncRun from './status/SyncRun';
import SyncSpatial from './status/SyncSpatial';
import SyncEquip from './status/SyncEquip';

export class OrganProcess {
  config: OrganConfigModel; // contains organ information
  graph: SpinalGraph<any>; // instance of graph
  mapStatusHandler: Map<number, IStatus> = new Map(); // gives info about current status of the organ

  constructor() { }

  /**
   * Get organ config from spinalhub.
   * Throws error if config not accessible for whathever reason.
   * Else Initialize organ process (0: StandBy, 1: SyncProcess, 2: SyncRun, 3: SyncSpatial, 4: SyncEquip)
   * @memberof OrganProcess
   */
  async init() {
    const organConfig = OrganConfig.getInstance();
    this.config = await organConfig.getConfig();
    const spinalIO = SpinalIO.getInstance();
    try {
      this.graph = await spinalIO.load(this.config.digitalTwinPath.get());
    } catch (e) {
      console.error(
        'Imposible to load the graph,',
        this.config.digitalTwinPath.get()
      );
    }

    this.mapStatusHandler.set(0, new StandBy());
    this.mapStatusHandler.set(1, new SyncSpatial(this.graph, this.config));
    this.mapStatusHandler.set(2, new SyncProcess(this.graph, this.config));
    this.mapStatusHandler.set(3, new SyncRun(this.graph, this.config));
    this.mapStatusHandler.set(4, new SyncEquip(this.graph, this.config));
  }

  /**
   * Run organ process
   *
   * @memberof OrganProcess
   */
  run() {
    let currentHandler: IStatus = null;
    this.config.mission.organStatus.bind(async () => {
      const currStatus: number = this.config.mission.organStatus.get();

      console.log('current status', currStatus);
      if (currentHandler !== null) {
        await currentHandler.stop();
      }

      if (this.mapStatusHandler.has(currStatus)) {
        const handler = this.mapStatusHandler.get(currStatus);
        currentHandler = handler;
        await handler.start();
        this.config.mission.organStatus.set(0);
        currentHandler = null;
      }
    }, true);
  }
}
