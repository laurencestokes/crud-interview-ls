// src/mocks/handlers.js
import { faker } from '@faker-js/faker';
import { delay, http, HttpResponse } from 'msw';
import { db } from "./db";

export const handlers = [
  http.get('https://example.com/user', async () => {
    await delay(1000)
    const users = await db.user.getAll();
    return HttpResponse.json({ users })
  }),
  http.get('https://example.com/user/:id', async ({params}) => {
    const { id } = params;
    const user = await db.user.findFirst({ id });
    return HttpResponse.json({ user })
  }),
  http.post('https://example.com/user', async ({request}) => {
    const { firstName, dateOfBirth, lastName } = await request.json()
    await db.user.create({
      firstName,
      id: faker.string.uuid(),
      dateOfBirth,
      lastName
    });

    // check if user name already exists

    return HttpResponse.json("User created!", {
      status: 201,  headers: {
      'Content-Type': 'text/plain',
      }
    })
  }),
  http.put('https://example.com/user/:id', async ({request, params}) => {
    const { id } = params;
    const { firstName, dateOfBirth, lastName } = await request.json()

    const user = await db.user.findFirst({ id });
    if (!user) {
      // returns with status code 404
      return HttpResponse.json(`User not found`, {
        status: 404,  headers: {
        'Content-Type': 'text/plain',
        }
      })
    }
    await db.user.update({
      where: {
        id: {
          equals: id,
        },
      },
      data: { firstName, lastName, dateOfBirth }
    });

    return HttpResponse.json(`User ${id} edited`, {
      status: 204,  headers: {
      'Content-Type': 'text/plain',
      }
    })
  }),
  http.delete('https://example.com/user/:id', async ({params}) => {
    const { id } = params;

    const user = await db.user.findFirst({ id });

    if (!user) {
      // returns with status code 404
      return HttpResponse.json(`User not found`, {
        status: 404,  headers: {
        'Content-Type': 'text/plain',
        }
      })
    }

    await db.user.delete({
      where: {
        id: {
          equals: id,
        },
      },
      strict: true
    });

    return HttpResponse.json(`User ${id} deleted`, {
      status: 204,  headers: {
      'Content-Type': 'text/plain',
      }
    })
  }),
]