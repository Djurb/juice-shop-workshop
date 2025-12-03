/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import challengeUtils = require('../lib/challengeUtils')
import { type Request, type Response, type NextFunction } from 'express'

const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const security = require('../lib/insecurity')

// vuln-code-snippet start noSqlReviewsChallenge forgedReviewChallenge
module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = String(req.body.id).replace(/[^a-f0-9]/gi, '').substring(0, 24) // Sanitize MongoDB ObjectId
    if (!id || id.length !== 24) {
      res.status(400).json({ error: 'Invalid review ID' })
      return
    }
    const user = security.authenticatedUsers.from(req) // vuln-code-snippet vuln-line forgedReviewChallenge
    // Sanitize message to ensure it's a string and remove MongoDB operators
    const sanitizedMessage = typeof req.body.message === 'string' ? req.body.message : String(req.body.message)
    db.reviews.update( // vuln-code-snippet neutral-line forgedReviewChallenge
      { _id: id }, // Fixed: Using sanitized ID to prevent NoSQL injection
      { $set: { message: sanitizedMessage } },
      { multi: true } // vuln-code-snippet vuln-line noSqlReviewsChallenge
    ).then(
      (result: { modified: number, original: Array<{ author: any }> }) => {
        challengeUtils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 }) // vuln-code-snippet hide-line
        challengeUtils.solveIf(challenges.forgedReviewChallenge, () => { return user?.data && result.original[0] && result.original[0].author !== user.data.email && result.modified === 1 }) // vuln-code-snippet hide-line
        res.json(result)
      }, (err: unknown) => {
        res.status(500).json(err)
      })
  }
}
// vuln-code-snippet end noSqlReviewsChallenge forgedReviewChallenge
