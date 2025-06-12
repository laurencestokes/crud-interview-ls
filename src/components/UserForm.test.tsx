import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserForm from './UserForm';

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('renders the form correctly', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserForm onSubmit={mockOnSubmit} />
      </QueryClientProvider>
    );
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create user/i })
    ).toBeInTheDocument();
  });

  it('validates that last name is required', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserForm onSubmit={mockOnSubmit} />
      </QueryClientProvider>
    );

    const lastNameInput = screen.getByLabelText(/Last Name/i);
    // Had to do this to trigger the validation (change from empty to non-empty)
    fireEvent.change(lastNameInput, { target: { value: 'test' } });
    fireEvent.change(lastNameInput, { target: { value: '' } });
    fireEvent.blur(lastNameInput);

    // Wait for the error message
    await waitFor(() => {
      const errorMessage = screen.getByText(/Last name is required/i);
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify submit wasn't called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates that date of birth cannot be in the future', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserForm onSubmit={mockOnSubmit} />
      </QueryClientProvider>
    );

    const dateInput = screen.getByLabelText(/date of birth/i);
    fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(
        screen.getByText(/date of birth cannot be in the future/i)
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UserForm onSubmit={mockOnSubmit} />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '1990-01-01' },
    });

    const submitButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      });
    });
  });

  it('shows a general error if the mutation fails', async () => {
    const queryClient = new QueryClient();
    const mockError = new Error('Failed to create user');
    mockOnSubmit.mockRejectedValueOnce(mockError);

    render(
      <QueryClientProvider client={queryClient}>
        <UserForm onSubmit={mockOnSubmit} />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '1990-01-01' },
    });

    const submitButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create user/i)).toBeInTheDocument();
    });
  });

  it('handles form submission error correctly', async () => {
    const queryClient = new QueryClient();
    const mockError = new Error('Network error');
    mockOnSubmit.mockRejectedValueOnce(mockError);

    render(
      <QueryClientProvider client={queryClient}>
        <UserForm onSubmit={mockOnSubmit} />
      </QueryClientProvider>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '1990-01-01' },
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/failed to create user/i)).toBeInTheDocument();
    });

    // Verify form is still interactive
    expect(submitButton).not.toBeDisabled();
  });

  describe('submit button text', () => {
    it('shows "Create User" by default', () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <UserForm onSubmit={mockOnSubmit} />
        </QueryClientProvider>
      );
      expect(
        screen.getByRole('button', { name: /create user/i })
      ).toBeInTheDocument();
    });

    it('shows "Creating..." while submitting new user', async () => {
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <UserForm onSubmit={mockOnSubmit} />
        </QueryClientProvider>
      );

      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1990-01-01' },
      });

      const submitButton = screen.getByRole('button', { name: /create user/i });
      fireEvent.click(submitButton);

      expect(
        screen.getByRole('button', { name: /creating/i })
      ).toBeInTheDocument();
    });

    it('shows "Save" when editing existing user', () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <UserForm
            onSubmit={mockOnSubmit}
            defaultValues={{
              firstName: 'John',
              lastName: 'Doe',
              dateOfBirth: '1990-01-01',
            }}
          />
        </QueryClientProvider>
      );
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('shows "Saving..." while submitting edit', async () => {
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <UserForm
            onSubmit={mockOnSubmit}
            defaultValues={{
              firstName: 'John',
              lastName: 'Doe',
              dateOfBirth: '1990-01-01',
            }}
          />
        </QueryClientProvider>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(submitButton);

      expect(
        screen.getByRole('button', { name: /saving/i })
      ).toBeInTheDocument();
    });
  });
});
