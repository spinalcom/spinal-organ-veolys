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
  SpinalGraphService,
  SpinalNode,
} from 'spinal-env-viewer-graph-service';
import {
  GEOGRAPHIC_TYPES,
  GEO_BUILDING_TYPE,
  GEO_EQUIPMENT_TYPE,
  GEO_FIND_EQUIPMENT,
  GEO_FIND_FLOOR,
  GEO_FIND_ROOM,
  GEO_FLOOR_TYPE,
  GEO_REFERENCE_TYPE,
  GEO_RELATIONS,
  GEO_ROOM_TYPE,
  GEO_ZONE_TYPE,
  SPINAL_TICKET_SERVICE_STEP_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
} from '../constants';
import OrganConfigModel from '../model/OrganConfigModel';
import { join as resolvePath } from 'path';
import { serializeLocal } from './serializeLocal';
import { SpinalNodeGetParent } from './SpinalNodeGetParent';

const GEO_NODE_TYPES = [
  GEO_BUILDING_TYPE,
  GEO_FLOOR_TYPE,
  GEO_ZONE_TYPE,
  GEO_ROOM_TYPE,
  GEO_EQUIPMENT_TYPE,
  GEO_REFERENCE_TYPE
]

const GEO_BIMOBJ_TYPES = [GEO_EQUIPMENT_TYPE, GEO_REFERENCE_TYPE]

export async function getLocalFromTicket(ticketId: string): Promise<SpinalNode<any>[]> {
  const realNode = SpinalGraphService.getRealNode(ticketId);
  const parents = await SpinalNodeGetParent(
    realNode,
    SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME
  );

  const filt: Promise<SpinalNode<any>[]>[] = parents.reduce((acc: Promise<SpinalNode<any>[]>[], parent: SpinalNode<any>): Promise<SpinalNode<any>[]>[] => {
    if (GEO_NODE_TYPES.includes(parent?.getType().get())) {
      (<any>SpinalGraphService)._addNode(parent);
      if (GEO_BIMOBJ_TYPES.includes(parent?.getType().get())) {
        acc.push(SpinalNodeGetParent(
          realNode,
          GEO_FIND_EQUIPMENT
        ));
      } else {
        acc.push(Promise.resolve([parent]));
      }
    }
    return acc;
  }, []);
  const res = await Promise.all(filt)
  return res.reduce((acc: SpinalNode<any>[], current: SpinalNode<any>[]): SpinalNode<any>[] => {
    acc.push(...current)
    return acc;
  }, [])
}

export async function getTicketElems(ticketId: string): Promise<SpinalNode<any>[]> {
  const realNode = SpinalGraphService.getRealNode(ticketId);
  const parents = await SpinalNodeGetParent(
    realNode,
    SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME
  );

  return parents.reduce((acc: SpinalNode<any>[], parent: SpinalNode<any>): SpinalNode<any>[] => {
    if (parent.getType().get() !== SPINAL_TICKET_SERVICE_STEP_TYPE) {
      (<any>SpinalGraphService)._addNode(parent);
      acc.push(parent);
    }
    return acc;
  }, []);

}

export async function getTicketLocals(ticketId: string): Promise<{
  elem: SpinalNode<any>;
  local: SpinalNode<any>;
}> {
  const ticketElems = await getTicketElems(ticketId);
  if (ticketElems.length === 0) throw new Error('BimObject not found');
  const ticketElem = ticketElems[0]
  if (GEO_BIMOBJ_TYPES.includes(ticketElem?.getType().get())) {
    const parents = await SpinalNodeGetParent(
      ticketElem,
      GEO_FIND_EQUIPMENT
    );
    return {
      elem: ticketElem,
      local: parents[0],
    };
  }
  return {
    elem: ticketElem,
    local: ticketElem,
  };
}
export async function getGeoPathFromZone(
  zoneNode: SpinalNode<any>,
  children: string[] = []
) {
  return handleGeo(zoneNode, children);
}
function handleGeo(zoneNode: SpinalNode<any>, children: string[] = []): Promise<string> {
  switch (zoneNode.info.type.get()) {
    case GEO_BUILDING_TYPE:
      return Promise.resolve(handleBuilding(zoneNode, children));
    case GEO_FLOOR_TYPE:
      return handleFloor(zoneNode, children);
    case GEO_ZONE_TYPE:
      return handleZone(zoneNode, children);
    case GEO_ROOM_TYPE:
      return handleRoom(zoneNode, children);
    case GEO_EQUIPMENT_TYPE:
      return handleEquiment(zoneNode);
    case GEO_REFERENCE_TYPE:
      return handleReference(zoneNode);
    default:
      console.log(zoneNode.info.name.get());

      throw new Error('BimObject not found');
  }
}

function handleBuilding(
  ticketElem: SpinalNode<any>,
  children: string[] = []
): string | PromiseLike<string> {
  return resolvePath(
    serializeLocal(ticketElem.info.name.get()),
    ...children.map((e) => serializeLocal(e)).reverse()
  );
}

async function handleFloor(
  ticketElem: SpinalNode<any>,
  children: string[] = []
): Promise<string> {
  const parents = await SpinalNodeGetParent(ticketElem, GEO_FIND_FLOOR);
  children.push(ticketElem.info.name.get());
  for (const parent of parents) {
    if (GEOGRAPHIC_TYPES.includes(parent.info.type.get())) {
      return handleGeo(parent, children);
    }
  }
}

async function handleZone(
  ticketElem: SpinalNode<any>,
  children: string[] = []
): Promise<string> {
  const parents = await SpinalNodeGetParent(ticketElem, GEO_RELATIONS);
  for (const parent of parents) {
    if (GEOGRAPHIC_TYPES.includes(parent.info.type.get())) {
      return handleGeo(parent, children);
    }
  }
}

async function handleRoom(
  ticketElem: SpinalNode<any>,
  children: string[] = []
): Promise<string> {
  const parents = await SpinalNodeGetParent(ticketElem, GEO_FIND_ROOM);
  children.push(ticketElem.info.name.get());
  for (const parent of parents) {
    if (parent && GEOGRAPHIC_TYPES.includes(parent.info.type.get())) {
      return handleGeo(parent, children);
    }
  }
}

async function handleEquiment(ticketElem: SpinalNode<any>): Promise<string> {
  const parents = await SpinalNodeGetParent(ticketElem, GEO_FIND_EQUIPMENT);
  for (const parent of parents) {
    if (GEOGRAPHIC_TYPES.includes(parent.info.type.get())) {
      return handleGeo(parent);
    }
  }
  throw new Error('BimObject not found');
}

async function handleReference(ticketElem: SpinalNode<any>): Promise<string> {
  const parents = await SpinalNodeGetParent(ticketElem, GEO_FIND_EQUIPMENT);
  for (const parent of parents) {
    if (GEOGRAPHIC_TYPES.includes(parent.info.type.get())) {
      return handleGeo(parent);
    }
  }
  throw new Error('BimObject not found');
}
