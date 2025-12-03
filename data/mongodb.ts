/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Low } from 'lowdb'
import { Memory } from 'lowdb'

// Simple in-memory collections replacing MarsDB
interface ReviewDoc { [key: string]: any }
interface OrderDoc { [key: string]: any }

const reviewsData: ReviewDoc[] = []
const ordersData: OrderDoc[] = []

const reviews = {
  find: (query: any) => Promise.resolve(reviewsData.filter(r => Object.keys(query).every(k => r[k] === query[k]))),
  update: (query: any, update: any, options?: any) => {
    const matches = reviewsData.filter(r => Object.keys(query).every(k => r[k] === query[k]))
    matches.forEach(r => Object.assign(r, update.$set || update))
    return Promise.resolve({ modified: matches.length, original: matches })
  },
  insert: (doc: any) => { reviewsData.push(doc); return Promise.resolve(doc) },
  remove: (query: any) => {
    const initialLength = reviewsData.length
    reviewsData.splice(0, reviewsData.length, ...reviewsData.filter(r => !Object.keys(query).every(k => r[k] === query[k])))
    return Promise.resolve({ deleted: initialLength - reviewsData.length })
  }
}

const orders = {
  find: (query: any) => Promise.resolve(ordersData.filter(o => Object.keys(query).every(k => o[k] === query[k]))),
  insert: (doc: any) => { ordersData.push(doc); return Promise.resolve(doc) },
  remove: (query: any) => {
    const initialLength = ordersData.length
    ordersData.splice(0, ordersData.length, ...ordersData.filter(o => !Object.keys(query).every(k => o[k] === query[k])))
    return Promise.resolve({ deleted: initialLength - ordersData.length })
  }
}

const db = {
  reviews,
  orders
}

module.exports = db
