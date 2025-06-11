import React, { useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import UserForm from './components/UserForm';
import UserList from './components/UserList';

const theme = createTheme();

const App: React.FC = () => {
  const [users, setUsers] = useState<
    Array<{
      id: string;
      firstName?: string;
      lastName: string;
      dateOfBirth: string;
    }>
  >([]);

  const handleCreateUser = (user: {
    firstName?: string;
    lastName: string;
    dateOfBirth: string;
  }) => {
    setUsers([...users, { ...user, id: Date.now().toString() }]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          User Admin Web Application
        </Typography>
        <UserForm onSubmit={handleCreateUser} />
        <UserList users={users} />
      </Container>
    </ThemeProvider>
  );
};

export default App;
