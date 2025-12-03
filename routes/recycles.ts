/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { RecycleModel } from '../models/recycle'

import * as utils from '../lib/utils'

exports.getRecycleItem = () => (req: Request, res: Response) => {
  // Sanitize input to prevent XSS and injection attacks
  const id = parseInt(req.params.id, 10)
  if (isNaN(id) || id < 0) {
    return res.status(400).json({ error: 'Invalid recycle item ID' })
  }
  RecycleModel.findAll({
    where: {
      id
    }
  }).then((Recycle) => {
    return res.json(utils.queryResultToJson(Recycle))
  }).catch((_: unknown) => {
    return res.status(500).json({ error: 'Error fetching recycled items. Please try again' })
  })
}

exports.blockRecycleItems = () => (req: Request, res: Response) => {
  const errMsg = { err: 'Sorry, this endpoint is not supported.' }
  return res.send(utils.queryResultToJson(errMsg))
}
