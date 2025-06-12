import { useState } from 'react';
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
} from '@mui/material';
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

function App() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [, setError] = useState<string | null>(null);

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', py: 6 }}>
      <Container maxWidth="sm">
        <Typography
          variant="h4"
          align="center"
          color="primary"
          fontWeight={700}
          gutterBottom
        >
          User Management
        </Typography>
        <Paper sx={{ mt: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={handleOpenAdd}>
              Add User
            </Button>
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
