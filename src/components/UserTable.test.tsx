import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserTable from './UserTable';
import { User } from '../types';

const mockUsers: User[] = [
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
    dateOfBirth: '1992-05-15',
  },
];

const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('UserTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    global.fetch = jest.fn();
  });

  it('renders loading state', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch')
    );
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });

  it('renders empty state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: [] }),
    });
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it('renders user data correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('01/01/1990')).toBeInTheDocument();
    });
  });

  it('handles edit action', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    await waitFor(() => {
      const editButton = screen.getByTestId('edit-user-1');
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  it('handles delete action', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-user-1');
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith(mockUsers[0].id);
    });
  });

  it('disables delete button while deleting', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });
    renderWithQueryClient(
      <UserTable
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={true}
      />
    );

    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-user-1');
      expect(deleteButton).toBeDisabled();
    });
  });

  it('handles select all checkbox', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );
    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
    fireEvent.click(checkboxes[0]); // Get the select all checkbox

    // Verify "2 selected" appears
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });
  });

  it('shows 1 selected text when 1 user is selected', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    // Select first user
    const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
    console.log('checkboxes', checkboxes);
    fireEvent.click(checkboxes[1]); // Select first user

    // Verify "1 selected" appears
    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });

  it('shows delete selected button when at least one user is selected', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers }),
    });
    renderWithQueryClient(
      <UserTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    await waitFor(
      async () => {
        // Click first row checkbox and wait for selection to update
        const checkboxes = await screen.getAllByRole('checkbox', {
          hidden: true,
        });
        fireEvent.click(checkboxes[1]); // Select first user
        const bulkDeleteButton = screen.getByRole('button', {
          name: /delete selected/i,
        });
        expect(bulkDeleteButton).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
