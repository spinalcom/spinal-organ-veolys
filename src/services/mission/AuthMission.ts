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

import OrganConfigModel from '../../model/OrganConfigModel';
import moment = require('moment-timezone');
import axios from 'axios';
import * as axiosRetry from 'axios-retry';
const client = axios.create({ baseURL: 'https://www.api.alteva.eu:444' });
// @ts-ignore
axiosRetry(client, { retryDelay: axiosRetry.exponentialDelay });

export interface IAuthentificationRes {
  chNumSession: string;
  chValidite: string; // ex : "09/04/2021 15:55"
}

function getToken(
  chLogin: string,
  chPassword: string
): Promise<IAuthentificationRes> {
  return client
    .post('APIAlteva/Authentification', { chLogin, chPassword })
    .then((res) => {
      return res.data;
    });
}
function isAuthTimedout(timeout: moment.Moment): boolean {
  const now = moment();
  if (timeout && now.isSameOrAfter(timeout)) {
    return true;
  }
  return false;
}

async function* tokenGenerator(
  login: string,
  pass: string
): AsyncGenerator<string, undefined, undefined> {
  let lastToken: IAuthentificationRes = await getToken(login, pass);
  while (true) {
    yield lastToken.chNumSession;
    const timeout = moment.tz(
      lastToken.chValidite,
      'DD/MM/YYYY HH:mm',
      "Europe/Paris"
    );
    timeout.subtract(5, 'minute');
    if (isAuthTimedout(timeout)) {
      try {
        lastToken = await getToken(login, pass);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

let generator: AsyncGenerator<string, undefined, undefined> = null;

export function getApiToken(config: OrganConfigModel): Promise<string> {
  if (generator === null)
    generator = tokenGenerator(
      config.mission.apiLogin.get(),
      config.mission.apiPassword.get()
    );

  return generator.next().then((data) => data.value);
}
