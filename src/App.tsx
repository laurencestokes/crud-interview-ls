import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

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
  const res = await fetch(`https://example.com/user/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
};

function App() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', dateOfBirth: '' });
  const [error, setError] = useState<string | null>(null);

  // Fetch users
  const { data: users, isLoading, isError } = useQuery<User[]>({
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
    setForm({ firstName: '', lastName: '', dateOfBirth: '' });
    setDialogOpen(true);
    setError(null);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
    });
    setDialogOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (editingUser) {
      updateMutation.mutate({ ...editingUser, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" align="center" color="primary" fontWeight={700} gutterBottom>
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Date of Birth</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users && users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell>{user.dateOfBirth}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleOpenEdit(user)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(user.id)} disabled={deleteMutation.isPending}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users && users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                        No users found. Add your first user!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Add/Edit User Dialog */}
        <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="xs">
          <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
          <Box component="form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <DialogContent>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                margin="normal"
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                margin="normal"
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                margin="normal"
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingUser ? 'Save' : 'Add'}
              </Button>
            </DialogActions>
          </Box>
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
