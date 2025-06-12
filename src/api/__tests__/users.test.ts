import { fetchUsers, createUser, updateUser, deleteUser } from '../users';
import { User } from '../../types';

// Mock the global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('User API', () => {
  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchUsers', () => {
    it('fetches users successfully', async () => {
      const mockUsers = [mockUser];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: mockUsers }),
      });

      const result = await fetchUsers();
      expect(result).toEqual(mockUsers);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/user');
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('createUser', () => {
    it('creates a user successfully', async () => {
      const newUser = { ...mockUser };
      const createdUser = { ...newUser };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...newUser }),
      });

      const result = await createUser(newUser);
      expect(result).toMatchObject(createdUser);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/user',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        })
      );
    });

    it('throws error when creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        createUser({ ...mockUser, id: undefined } as unknown as User)
      ).rejects.toThrow('Failed to create user');
    });
  });

  describe('updateUser', () => {
    it('updates a user successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await updateUser(mockUser);
      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/user/1',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockUser),
        })
      );
    });

    it('throws error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(updateUser(mockUser)).rejects.toThrow(
        'Failed to update user'
      );
    });
  });

  describe('deleteUser', () => {
    it('deletes a user successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await deleteUser('1');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/user/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('throws error when deletion fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(deleteUser('1')).rejects.toThrow('Failed to delete user');
    });
  });
});
