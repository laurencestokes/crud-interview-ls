// src/mocks/browser.js
import { setupWorker } from 'msw/browser'
// import { handlers } from './handlers'
// import { setupServer } from 'msw/node'

import { handlers } from './handlers'

// const db = factory({
//   user: {
//     id: primaryKey(faker.string.uuid),
//     firstName: String,
//   },
// })

// const handlers = [...db.user.toHandlers('rest', "https://example.com")]
 
export const worker = setupWorker(...handlers)
