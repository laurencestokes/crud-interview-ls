import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
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
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
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
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    await act(async () => {
      const editButton = screen.getByTestId('edit-user-1');
      fireEvent.click(editButton);
    });

    expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0]);
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
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    await act(async () => {
      const deleteButton = screen.getByTestId('delete-user-1');
      fireEvent.click(deleteButton);
    });

    expect(mockOnDelete).toHaveBeenCalledWith(mockUsers[0].id);
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
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-user-1');
    expect(deleteButton).toBeDisabled();
  });

  it('shows 1 row selected text when 1 user is selected', async () => {
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
    await act(async () => {
      const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
      fireEvent.click(checkboxes[1]); // Select first user
    });

    // Verify "1 selected" appears
    await waitFor(() => {
      expect(screen.getByText('1 row selected')).toBeInTheDocument();
    });
  });
});
