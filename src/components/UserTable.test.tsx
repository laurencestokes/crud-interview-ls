import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserTable from './UserTable';

describe('UserList', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            users: [
              {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
              },
              {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith',
                dateOfBirth: '1992-02-02',
              },
            ],
          }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the list of users correctly', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserTable />
      </QueryClientProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth: 1990-01-01')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth: 1992-02-02')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching users', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserTable />
      </QueryClientProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <UserTable />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API response is not ok', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <UserTable />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no users are found', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ users: [] }),
      })
    );

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserTable />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it('handles users with missing first name', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            users: [
              {
                id: '1',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
              },
            ],
          }),
      })
    );

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserTable />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth: 1990-01-01')).toBeInTheDocument();
    });
  });
});
