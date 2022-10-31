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
import {AxiosInstance} from 'axios';

export interface IAuthentificationRes {
  token: string;
  data: string;
}

function getToken(
  chLogin: string,
  chPassword: string,
  axios: AxiosInstance
): Promise<IAuthentificationRes> {
  return axios
    .post('/ws/login_check', { "_username":chLogin, "_password":chPassword })
    .then((res) => {
      return res.data;
    });
}
function isAuthTimedout(expire_at): boolean {
  const now = new Date().getTime();
    return now  > expire_at;
}

async function* tokenGenerator(
  login: string,
  pass: string,
  axios:AxiosInstance
): AsyncGenerator<string, undefined, undefined> {
  let lastToken: IAuthentificationRes = await getToken(login, pass,axios);
  while (true) {
    yield lastToken.token;
    const now = new Date().getTime();
    const expire_at = now+3600*1000; // 1 hour
    
    if (isAuthTimedout(expire_at)) {
      try {
        lastToken = await getToken(login, pass,axios);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

let generator: AsyncGenerator<string, undefined, undefined> = null;

export function getApiToken(config: OrganConfigModel,axios:AxiosInstance): Promise<string> {
  if (generator === null)
    generator = tokenGenerator(
      config.mission.apiLogin.get(),
      config.mission.apiPassword.get(),
      axios
    );

  return generator.next().then((data) => data.value);
}
