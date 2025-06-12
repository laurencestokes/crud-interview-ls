import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserForm from './UserForm';

describe('UserForm', () => {
    beforeAll(() => {
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
                <UserForm />
            </QueryClientProvider>
        );
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
    });

    it('validates that last name is required', async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <UserForm />
            </QueryClientProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: /create user/i }));
        await waitFor(() => {
            expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        });
    });

    it('validates that date of birth cannot be in the future', async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <UserForm />
            </QueryClientProvider>
        );
        const dateInput = screen.getByLabelText(/date of birth/i);
        fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
        fireEvent.click(screen.getByRole('button', { name: /create user/i }));
        await waitFor(() => {
            expect(screen.getByText(/date of birth cannot be in the future/i)).toBeInTheDocument();
        });
    });

    it('submits the form with valid data', async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <UserForm />
            </QueryClientProvider>
        );
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } });
        fireEvent.click(screen.getByRole('button', { name: /create user/i }));
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/user',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });
    });

    it('shows a general error if the mutation fails', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({ ok: false })
        );
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <UserForm />
            </QueryClientProvider>
        );
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } });
        fireEvent.click(screen.getByRole('button', { name: /create user/i }));
        await waitFor(() => {
            expect(screen.getByText(/failed to create user/i)).toBeInTheDocument();
        });
    });
});
