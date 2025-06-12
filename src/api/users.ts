import { User } from '../types';

const API_BASE_URL = 'https://example.com/user';

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users;
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to create user');
  const data = await res.json();
  // Return the created user with the submitted data and generated ID
  return {
    id: data.id || crypto.randomUUID(),
    ...user,
  };
};

export const updateUser = async (user: User): Promise<User> => {
  const res = await fetch(`${API_BASE_URL}/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return user;
};

export const deleteUser = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
};
