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

import type IStatus from './IStatus';
import {
  SpinalGraphService,
  SpinalContext,
  SpinalGraph,
  SpinalNode,
} from 'spinal-env-viewer-graph-service';
import {
  GEO_BUILDING_TYPE,
  GEO_FIND_BUILDING,
  GEO_FIND_FLOOR,
  GEO_FIND_ROOM,
  GEO_FLOOR_TYPE,
  GEO_ROOM_TYPE,
} from '../../constants';
import type OrganConfigModel from '../../model/OrganConfigModel';
import { join as resolvePath } from 'path';
import { getApiToken } from '../../services/mission/AuthMission';
import getLocauxListe, {
  ILocauxListe,
} from '../../services/mission/getLocauxListe';
import LocauxCree from '../../services/mission/LocauxCree';
import { serializeLocal } from '../../utils/serializeLocal';
import attributeService from 'spinal-env-viewer-plugin-documentation-service';
import type { SpinalAttribute } from 'spinal-models-documentation';

interface BuildingNode {
  Local: string;
  name: string;
  LocalPere: string;
  chIdentifLong: string;
}

export default class SyncSpatial implements IStatus {
  graph: SpinalGraph<any>;
  config: OrganConfigModel;
  buildings: BuildingNode[] = [];
  constructor(graph: SpinalGraph<any>, config: OrganConfigModel) {
    this.graph = graph;
    this.config = config;
  }

  createNode(
    localPere: string,
    local: string,
    chIdentifLong: string
  ): BuildingNode {
    // tslint:disable-next-line:variable-name
    const Local = resolvePath(localPere, local);
    return { Local, chIdentifLong, LocalPere: localPere, name: local };
  }

  async handleSite(
    result: BuildingNode[],
    context: SpinalContext<any>,
    prefix: string
  ): Promise<void> {
    const sites = prefix.split('/');

    let lastSite = '';
    for (const siteName of sites) {
      if (siteName) {
        // const site = this.createNode(lastSite, siteName, '');
        lastSite = resolvePath(lastSite, siteName);
        // result.push(site);
      }
    }
    return this.handleBuilding(result, context, lastSite);
  }

  async handleBuilding(
    result: BuildingNode[],
    currentNode: SpinalNode<any>,
    parent: string
  ): Promise<void> {
    const buildings = await currentNode.find(GEO_FIND_BUILDING, (node) => {
      return node.getType()?.get() === GEO_BUILDING_TYPE;
    });
    for (const node of buildings) {
      const building = this.createNode(
        parent,
        serializeLocal(node.info?.name?.get() ?? 'building'),
        node.info?.id?.get() ?? ''
      );
      result.push(building);
      this.buildings.push(building);
      await this.handleFloor(result, node, building);
    }
  }

  async handleFloor(
    result: BuildingNode[],
    currentNode: SpinalNode<any>,
    parent: BuildingNode
  ): Promise<void> {
    const floors = await currentNode.find(
      GEO_FIND_FLOOR,
      (node: SpinalNode<any>): boolean => {
        return node.getType()?.get() === GEO_FLOOR_TYPE;
      }
    );
    for (const node of floors) {
      const floor = this.createNode(
        parent.Local,
        serializeLocal(node.info?.name?.get() ?? 'floor'),
        node.info?.id?.get() ?? ''
      );
      result.push(floor);
      await this.handleLocal(result, node, floor);
    }
  }

  async handleLocal(
    result: BuildingNode[],
    currentNode: SpinalNode<any>,
    parent: BuildingNode
  ): Promise<void> {
    const locals = await currentNode.find(
      GEO_FIND_ROOM,
      (node: SpinalNode<any>): boolean => {
        return node.getType()?.get() === GEO_ROOM_TYPE;
      }
    );
    const promises = locals.map(async (node: SpinalNode<any>) => {
      const localname = await this.getLocalName(node);
      if (localname !== '') {
        const local = this.createNode(
          parent.Local,
          localname,
          node.info?.id?.get() ?? ''
        );
        result.push(local);
      }
    });
    await Promise.all(promises);
  }

  /**
   *
   * @param {SpinalNode<any>} node
   * @return {*}  {Promise<string>}
   * @memberof SyncSpatial
   */
  async getLocalName(node: SpinalNode<any>): Promise<string> {
    /**
     * category / attributes:
     * - Spatial / name
     * - Spatial / number
     * - default / showCMMS
     * - default / aliasOccupant
     *
     * if showCMMS is true
     *   if aliasOccupant existe :
     *     nom de pièce mission = aliasOccupant
     *   else :
     *     nom   de pièce mission = number - name
     * if showCMMS is false
     *   ne pas créer de pièce dans le référentiel de mission
     */
    const showCMMS = await attributeService.findOneAttributeInCategory(
      node,
      'GMAO',
      'showCMMS'
    );
    if (showCMMS !== -1) {
      const show = showCMMS.value.get();
      if (show.toString().toLowerCase() === 'true') {
        const alias = await attributeService.findOneAttributeInCategory(
          node,
          'default',
          'aliasOccupant'
        );
        if (alias !== -1) return alias.value.get().toString();
        const name = await attributeService.findOneAttributeInCategory(
          node,
          'Spatial',
          'name'
        );
        const number = await attributeService.findOneAttributeInCategory(
          node,
          'Spatial',
          'number'
        );
        return `${number === -1 ? '' : number.value.get()} - ${
          name === -1 ? 'room' : name.value.get()
        }`;
      }
    }
    return '';
  }

  async getSpinalGeo(): Promise<BuildingNode[]> {
    const result: BuildingNode[] = [];
    const contexts = await this.graph.getChildren();
    for (const context of contexts) {
      if (context.info.id.get() === this.config.spatialContextID?.get()) {
        // @ts-ignore
        SpinalGraphService._addNode(context);
        await this.handleSite(
          result,
          context,
          this.config.mission.prefixBuilding?.get() ?? ''
        );
        return result;
      }
    }
    // contextId not found fallback
    const context = await this.graph.getContext('spatial');
    if (!context) throw new Error('Context Not found');
    await this.handleSite(
      result,
      context,
      this.config.mission.prefixBuilding?.get() ?? ''
    );
    return result;
  }

  async getLocalsMission(): Promise<ILocauxListe> {
    const token = await getApiToken(this.config);
    if (this.buildings.length === 1)
      return getLocauxListe(
        token,
        resolvePath(
          this.config.mission.prefixBuilding?.get(),
          this.buildings[0].name
        )
      );
    return getLocauxListe(
      token,
      this.config.mission.prefixBuilding?.get() ?? ''
    );
  }

  getMissingLocals(
    spinalGeo: BuildingNode[],
    localsMission: ILocauxListe
  ): BuildingNode[] {
    const missing = [];

    for (const item of spinalGeo) {
      let found = false;
      for (const local of localsMission.Locaux) {
        if (local.chIdentifLong === item.chIdentifLong) {
          found = true;
          break;
        }
      }
      if (!found) missing.push(item);
    }
    return missing;
  }

  async createPrefix() {
    const prefix = this.config.mission.prefixBuilding?.get() ?? '';
    const sites = prefix.split('/');
    let lastSite = '';
    for (const siteName of sites) {
      if (siteName) {
        const site = this.createNode(lastSite, siteName, '');
        lastSite = resolvePath(lastSite, siteName);
        const token = await getApiToken(this.config);
        const local = await getLocauxListe(token, site.Local, false);
        if (local.Locaux.length === 0) {
          if (!process.env.MODEDEBUG) {
            await LocauxCree(
              token,
              serializeLocal(site.name),
              site.LocalPere,
              site.chIdentifLong
            );
          } else {
            console.log('missing', site);
          }
        }
      }
    }
  }

  async start(): Promise<number> {
    console.log('start SyncSpatial');
    try {
      const spinalGeo = await this.getSpinalGeo();
      const localsMission = await this.getLocalsMission();
      const missing = this.getMissingLocals(spinalGeo, localsMission);
      console.log('missing', missing);
      await this.createPrefix();
      if (!process.env.MODEDEBUG) {
        for (const miss of missing) {
          const token = await getApiToken(this.config);
          await LocauxCree(
            token,
            serializeLocal(miss.name),
            miss.LocalPere,
            miss.chIdentifLong
          );
        }
      }
      console.log('end');
    } catch (e) {
      console.error(e);
    }
    return 0;
  }

  stop(): void {
    console.log('stop SyncSpatial');
  }
}
