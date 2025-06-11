import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import UserList from './UserList';

describe('UserList', () => {
  const mockUsers = [
    { id: '1', firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01' },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1992-02-02',
    },
  ];

  it('renders the list of users correctly', () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Date of Birth: 1990-01-01')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Date of Birth: 1992-02-02')).toBeInTheDocument();
  });
});
