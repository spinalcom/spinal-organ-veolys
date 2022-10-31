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
import type {
  SpinalContext,
  SpinalGraph,
  SpinalNode,
} from 'spinal-env-viewer-graph-service';
import type OrganConfigModel from '../../model/OrganConfigModel';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';

import { GEO_NODE_TYPES, GEO_EQUIPMENT_RELATION } from '../../constants';
import { consumeBatch } from '../../utils/consumeBatch';
import { getGeoPathFromZone } from '../../utils/getTicketLocal';
import { join as resolvePath } from 'path';
import MaterielCree from '../../services/mission/MaterielCree';
import { getApiToken } from '../../services/mission/AuthMission';
import MaterielListe, {
  IMaterielsItem,
} from '../../services/mission/MaterielListe';
import { createWriteStream } from 'fs';
import { SpinalNodeGetParent } from '../../utils/SpinalNodeGetParent';

interface IEquipment {
  name: string;
  name2?: string;
  nbrInstances?: number;
  roomPath: string;
  attr: string[];
}
interface IEquipZone {
  path: string;
  zone: SpinalNode<any>;
  equip: SpinalNode<any>;
}
interface IEquipObj {
  zone: SpinalNode<any>;
  path: string;
  equip: SpinalNode<any>;
}

type MapEquip = Map<string, IEquipment[]>;

interface IAttrEquip {
  name: string;
  isGroup: boolean;
}

export default class SyncEquip implements IStatus {
  graph: SpinalGraph<any>;
  config: OrganConfigModel;

  constructor(graph: SpinalGraph<any>, config: OrganConfigModel) {
    this.graph = graph;
    this.config = config;
  }

  async getEquipContext(): Promise<SpinalContext<any>[]> {
    const res = [];
    const contextIdToGet = this.config.mission.contextsEquip?.get();
    if (!contextIdToGet)
      throw new Error('getEquipContext: contextsEquip no found or empty');
    const contexts = await this.graph.getChildren();
    for (const context of contexts) {
      if (contextIdToGet.includes(context.info.id.get())) res.push(context);
    }
    return res;
  }

  private createOrPushMapAtKey<T, K>(map: Map<T, K[]>, key: T, value: K): void {
    if (!map.has(key)) {
      map.set(key, [value]);
    } else {
      map.get(key)?.push(value);
    }
  }
  private addEquipInstanceTo<T>(
    map: Map<T, IEquipment[]>,
    key: T,
    value: IEquipment
  ): void {
    if (!map.has(key)) {
      map.set(key, [value]);
      return;
    }
    const arr = map.get(key);
    const item = arr.find(
      (itm) => itm.name === value.name && itm.roomPath === value.roomPath
    );
    if (item) {
      if (!item.nbrInstances) item.nbrInstances = 1;
      item.nbrInstances += 1;
    } else {
      arr?.push(value);
    }
  }

  async getAttrEquip(node: SpinalNode<any>): Promise<IAttrEquip> {
    const attrs = await attributeService.getAttributesByCategory(
      node,
      'Mission'
    );
    let name = '';
    let group = '';
    for (const attr of attrs) {
      if (attr.label.get() === 'nomMission') name = attr.value.get().toString();
      if (attr.label.get() === 'GroupementZoneEquipement')
        group = attr.value.get().toString();
    }

    return {
      name,
      isGroup: group.toLowerCase() === 'true',
    };
  }

  createGrpEquip(
    res: MapEquip,
    grp: SpinalNode<any>,
    equips: IEquipZone[],
    conpleteName: string,
    pathTwinOps: string
  ): Promise<void[]> {
    const fcts: (() => Promise<void>)[] = [];
    for (const equip of equips) {
      fcts.push((): Promise<void> => {
        return this.getAttrEquip(equip.equip).then(
          ({ name, isGroup }: IAttrEquip): void => {
            if (name && name !== '-') {
              if (isGroup) {
                this.addEquipInstanceTo(res, equip.path, {
                  name: name,
                  roomPath: equip.path,
                  nbrInstances: 1,
                  attr: [grp.info.name.get(), conpleteName, pathTwinOps],
                });
              } else {
                this.createOrPushMapAtKey(res, equip.path, {
                  name: name,
                  roomPath: equip.path,
                  nbrInstances: 1,
                  attr: [grp.info.name.get(), conpleteName, pathTwinOps],
                });
              }
            }
          }
        );
      });
    }

    return consumeBatch(fcts, 10);
  }

  async getZonefromEquip(equip: SpinalNode<any>): Promise<SpinalNode<any>> {
    const parents = await SpinalNodeGetParent(equip, [GEO_EQUIPMENT_RELATION]);
    // const parents = await equip.getParents(GEO_EQUIPMENT_RELATION);
    for (const parent of parents) {
      if (GEO_NODE_TYPES.includes(parent.info.type.get())) return parent;
    }
    return undefined;
  }
  async getZonePath(zone: SpinalNode<any>): Promise<string> {
    if (zone) return getGeoPathFromZone(zone);
  }
  async getZonefromEquips(equips: SpinalNode<any>[]): Promise<IEquipZone[]> {
    const equipObjProms = equips.map(
      (equip: SpinalNode<any>): (() => Promise<IEquipObj>) => {
        return async (): Promise<IEquipObj> => {
          const zone = await this.getZonefromEquip(equip);
          const path = await this.getZonePath(zone);
          return { zone, path, equip };
        };
      }
    );
    const equipObjsTmp = await consumeBatch(equipObjProms, 10);
    return equipObjsTmp.filter((itm: IEquipObj): boolean => {
      return itm.zone !== undefined;
    });
  }

  async getEquipFromContext(
    res: MapEquip,
    context: SpinalContext<any>
  ): Promise<MapEquip> {
    const cats = await context.getChildrenInContext();
    for (const cat of cats) {
      const grps = await cat.getChildrenInContext(context);
      for (const grp of grps) {
        console.log(' - doing', grp.info.name.get());
        const [equips, attrs] = await Promise.all([
          grp.getChildrenInContext(context),
          attributeService.getAttributesByCategory(grp, 'GMAO'),
        ]);
        console.log(' - found equip', equips.length);
        const equipObjs = await this.getZonefromEquips(equips);
        let designation = '';
        let pathTwinOps = '';
        let toBreak = false;
        for (const attr of attrs) {
          switch (attr.label.get()) {
            case 'Path Mission':
              designation = attr.value.get().toString();
              break;
            case 'Path TwinOps':
              pathTwinOps = attr.value.get().toString();
              break;
            case 'Injection GMAO':
              toBreak = attr.value.get().toString().toLowerCase() === 'true';
              break;
            default:
              break;
          }
        }
        if (!toBreak) continue;
        await this.createGrpEquip(
          res,
          grp,
          equipObjs,
          designation,
          pathTwinOps
        );
      }
    }
    return res;
  }
  dumpInFile(res: MapEquip): void {
    const stream = createWriteStream('dump.csv');
    const l = [
      'room path',
      'equip name',
      'nbrInstances',
      'pathMission',
      'pathTwinOps',
    ];
    stream.write(l.join(',') + '\n');
    for (const [key, arr] of res) {
      const p = resolvePath(
        this.config.mission.prefixBuilding?.get() ?? '',
        key
      );
      for (const i of arr) {
        const l = [p, i.name, i.nbrInstances, i.attr[1], i.attr[2]];
        stream.write(l.join(',') + '\n');
      }
    }
    stream.close();
  }

  async start(): Promise<number> {
    console.log('start SyncEquip');
    try {
      const contexts = await this.getEquipContext();
      const res: MapEquip = new Map();

      for (const context of contexts) {
        await this.getEquipFromContext(res, context);
      }
      if (process.env.MODEDEBUG) this.dumpInFile(res);
      // send equipemnts.
      for (const [key, val] of res) {
        const p = resolvePath(
          this.config.mission.prefixBuilding?.get() ?? '',
          key
        );
        console.log('======', p);
        // filter map that already exist
        const token = await getApiToken(this.config);
        // getMats;
        const mats = await MaterielListe(token, p);
        // filter val with get mats
        console.log('get Mats');

        const filtered = val.filter((elem: IEquipment): boolean => {
          return !mats.Materiels.some((mat: IMaterielsItem): boolean => {
            return mat.Local.chLibelle === p && mat.Lib1 === elem.name;
          });
        });
        console.log('filtered', filtered.length);

        for (const item of filtered) {
          const token = await getApiToken(this.config);
          await MaterielCree(token, p, item.name, item.attr, item.nbrInstances);
        }
      }

      console.log('end');
    } catch (error) {
      console.error(error);
    }
    return 0;
  }

  stop() {
    console.log('stop SyncEquip');
  }
}
