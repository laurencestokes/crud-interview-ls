// src/mocks/db.js
import { faker } from '@faker-js/faker'
import { factory, primaryKey } from '@mswjs/data'

export const db = factory({
  // Create a "user" model,
  user: {
    // ...with these properties and value getters.
    id: primaryKey(faker.string.uuid()),
    firstName: () => undefined,
    lastName: () => 'Last name',
    dateOfBirth: () => Date.now(),
  },
})