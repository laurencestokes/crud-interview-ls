import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserForm from './UserForm';
import { User } from '../types';
import { format } from 'date-fns';

const mockOnSubmit = jest.fn();

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

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    renderWithQueryClient(<UserForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-of-birth-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithQueryClient(<UserForm onSubmit={mockOnSubmit} />);

    const lastNameInput = screen.getByTestId('last-name-input');
    fireEvent.change(lastNameInput, { target: { value: 'test' } });
    fireEvent.blur(lastNameInput);
    fireEvent.change(lastNameInput, { target: { value: '' } });

    const dateOfBirthInput = screen.getByTestId('date-of-birth-input');
    fireEvent.change(dateOfBirthInput, { target: { value: '01/01/1990' } });
    fireEvent.blur(dateOfBirthInput);
    fireEvent.change(dateOfBirthInput, { target: { value: '' } });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/date of birth is required/i)
      ).toBeInTheDocument();
    });
  });

  it('validates date of birth is not in the future', async () => {
    renderWithQueryClient(<UserForm onSubmit={mockOnSubmit} />);

    const dateInput = screen.getByTestId('date-of-birth-input');
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const formattedDate = format(futureDate, 'dd/MM/yyyy');

    fireEvent.change(dateInput, { target: { value: formattedDate } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(
        screen.getByText(/date of birth cannot be in the future/i)
      ).toBeInTheDocument();
    });
  });

  it('submits valid data', async () => {
    renderWithQueryClient(<UserForm onSubmit={mockOnSubmit} />);

    const firstNameInput = screen.getByTestId('first-name-input');
    const lastNameInput = screen.getByTestId('last-name-input');
    const dateInput = screen.getByTestId('date-of-birth-input');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(dateInput, { target: { value: '01/01/1990' } });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      });
    });
  });

  it('shows "Creating..." while submitting new user', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(() => {}));
    renderWithQueryClient(<UserForm onSubmit={mockOnSubmit} />);

    const firstNameInput = screen.getByTestId('first-name-input');
    const lastNameInput = screen.getByTestId('last-name-input');
    const dateInput = screen.getByTestId('date-of-birth-input');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(dateInput, { target: { value: '01/01/1990' } });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(
      screen.getByRole('button', { name: /creating/i })
    ).toBeInTheDocument();
  });

  it('shows "Saving..." while submitting existing user', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(() => {}));
    const existingUser: User = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
    };

    renderWithQueryClient(
      <UserForm defaultValues={existingUser} onSubmit={mockOnSubmit} />
    );

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
  });

  it('handles submission error', async () => {
    const error = new Error('Submission failed');
    mockOnSubmit.mockRejectedValueOnce(error);

    renderWithQueryClient(<UserForm onSubmit={mockOnSubmit} />);

    const firstNameInput = screen.getByTestId('first-name-input');
    const lastNameInput = screen.getByTestId('last-name-input');
    const dateInput = screen.getByTestId('date-of-birth-input');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(dateInput, { target: { value: '01/01/1990' } });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to create user: submission failed/i)
      ).toBeInTheDocument();
    });
  });
});
