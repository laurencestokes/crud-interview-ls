import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserList from './UserList';

beforeAll(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve({
                    users: [
                        { id: '1', firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01' },
                        { id: '2', firstName: 'Jane', lastName: 'Smith', dateOfBirth: '1992-02-02' },
                    ],
                }),
        })
    ) as jest.Mock;
});

afterAll(() => {
    jest.resetAllMocks();
});

describe('UserList', () => {
    it('renders the list of users correctly', async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <UserList />
            </QueryClientProvider>
        );
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Date of Birth: 1990-01-01')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Date of Birth: 1992-02-02')).toBeInTheDocument();
        });
    });
});
