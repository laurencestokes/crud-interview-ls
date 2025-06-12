import { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Grid,
  TextField,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import UserForm from './components/UserForm';
import UserTable from './components/UserTable';
import { User } from './types';

const queryClient = new QueryClient();

// API endpoints (handled by MSW)
const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('https://example.com/user');
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users;
};

const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const res = await fetch('https://example.com/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
};

const updateUser = async (user: User): Promise<User> => {
  const res = await fetch(`https://example.com/user/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return user;
};

const deleteUser = async (id: string): Promise<void> => {
  const res = await fetch(`https://example.com/user/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
};

// Utility for random user generation
const randomNames = [
  { first: 'Alice', last: 'Johnson' },
  { first: 'Bob', last: 'Smith' },
  { first: 'Charlie', last: 'Brown' },
  { first: 'Diana', last: 'Evans' },
  { first: 'Eve', last: 'Williams' },
  { first: 'Frank', last: 'Garcia' },
  { first: 'Grace', last: 'Martinez' },
  { first: 'Henry', last: 'Davis' },
  { first: 'Isabella', last: 'Rodriguez' },
  { first: 'Jack', last: 'Hernandez' },
  { first: 'Katherine', last: 'Lopez' },
  { first: 'Liam', last: 'Gomez' },
  { first: 'Mia', last: 'Perez' },
  { first: 'Noah', last: 'Sanchez' },
  { first: 'Olivia', last: 'Rivera' },
  { first: 'Parker', last: 'Torres' },
  { first: 'Quinn', last: 'Gonzalez' },
  { first: 'Ryan', last: 'Flores' },
  { first: 'Sophia', last: 'Lopez' },
  { first: 'Thomas', last: 'Garcia' },
  { first: 'Uma', last: 'Martinez' },
  { first: 'Victor', last: 'Davis' },
  { first: 'Wendy', last: 'Rodriguez' },
  { first: 'Xavier', last: 'Hernandez' },
  { first: 'Yara', last: 'Lopez' },
  { first: 'Zane', last: 'Gomez' },
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function App() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users
  const { isLoading, isError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
    },
    onError: () => setError('Failed to create user'),
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
    },
    onError: () => setError('Failed to update user'),
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: () => setError('Failed to delete user'),
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setDialogOpen(true);
    setError(null);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setError(null);
  };

  const handleGenerateRandomUser = useCallback(() => {
    const name = randomNames[getRandomInt(0, randomNames.length - 1)];
    const year = getRandomInt(1980, 2005);
    const month = getRandomInt(1, 12).toString().padStart(2, '0');
    const day = getRandomInt(1, 28).toString().padStart(2, '0');
    const dateOfBirth = `${year}-${month}-${day}`;
    createMutation.mutate({
      firstName: name.first,
      lastName: name.last,
      dateOfBirth,
    });
  }, [createMutation]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa' }}>
      {/* AppBar/Header */}
      <AppBar position="static">
        <Toolbar>
          <Avatar
            src="https://images.unsplash.com/photo-1549923746-c502d488b3ea"
            sx={{ width: 40, height: 40, marginRight: 2 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            User Management
          </Typography>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ marginTop: 4 }}>
        {/* Search/Add User Row */}
        <Grid container spacing={2} alignItems="center" marginBottom={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Search Users"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{ borderRadius: 8 }}
            >
              Add New User
            </Button>
            <Button
              variant="outlined"
              sx={{ borderRadius: 8, ml: 2 }}
              onClick={handleGenerateRandomUser}
            >
              Generate Random User
            </Button>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          </Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error">Failed to load users.</Alert>
          ) : (
            <UserTable
              onEdit={handleOpenEdit}
              onDelete={deleteMutation.mutate}
              isDeleting={deleteMutation.isPending}
              searchTerm={searchTerm}
              onSearchChange={e => setSearchTerm(e.target.value)}
            />
          )}
        </Paper>

        {/* Add/Edit User Dialog */}
        <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="xs">
          <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
          <UserForm
            defaultValues={editingUser || undefined}
            onSubmit={(data) => {
              if (editingUser) {
                updateMutation.mutate({ ...editingUser, ...data });
              } else {
                createMutation.mutate({
                  ...data,
                  firstName: data.firstName ?? '',
                });
              }
              handleClose();
            }}
          />
        </Dialog>
      </Container>
    </Box>
  );
}

export default function AppWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
