import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

interface User {
  id: string;
  firstName?: string;
  lastName: string;
  dateOfBirth: string;
}

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <List>
      {users.map((user) => (
        <ListItem key={user.id}>
          <ListItemText
            primary={`${user.firstName || ''} ${user.lastName}`}
            secondary={`Date of Birth: ${user.dateOfBirth}`}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default UserList;
