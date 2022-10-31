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

import SpinalIO from '../services/SpinalIO';

const imageToBase64 = require('image-to-base64');
export function getB64Image(file: any): Promise<string> {
  const spinalIO = SpinalIO.getInstance();

  let imgPath = `${spinalIO.config.protocol}://${spinalIO.config.host}`;
  if (spinalIO.config.port) imgPath += `:${spinalIO.config.port}`;
  imgPath += `/sceen/_?u=${file._ptr.data.value}`;
  return imageToBase64(imgPath)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error); // Logs an error if there was one
    });
}
