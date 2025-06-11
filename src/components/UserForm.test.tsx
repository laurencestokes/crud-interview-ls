import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import UserForm from './UserForm';

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form correctly', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create user/i })
    ).toBeInTheDocument();
  });

  it('validates that last name is required', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates that date of birth cannot be in the future', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    const dateInput = screen.getByLabelText(/date of birth/i);
    fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    expect(
      screen.getByText(/date of birth cannot be in the future/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '1990-01-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    expect(mockOnSubmit).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
    });
  });
});
