import { useQuery } from '@tanstack/react-query';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';

interface User {
  id: string;
  firstName?: string;
  lastName: string;
  dateOfBirth: string;
}

const UserList = () => {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('https://example.com/user');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return data.users;
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load users. Please try again later.
      </Alert>
    );
  }

  if (!users?.length) {
    return (
      <Typography color="text.secondary" align="center">
        No users found. Create your first user above!
      </Typography>
    );
  }

  return (
    <List>
      {users.map((user) => (
        <ListItem key={user.id} divider>
          <ListItemText
            primary={`${user.firstName || ''} ${user.lastName}`.trim()}
            secondary={`Date of Birth: ${user.dateOfBirth}`}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default UserList;
