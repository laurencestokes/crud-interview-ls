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
  Snackbar,
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
import { fetchUsers, createUser, updateUser, deleteUser } from './api/users';
import { useSnackbar } from './hooks/useSnackbar';
import { useThemeMode } from './theme/ThemeProvider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import { useTheme } from '@mui/material/styles';

const queryClient = new QueryClient();

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
  const [searchTerm, setSearchTerm] = useState('');
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();

  // Fetch users
  const { isLoading, isError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
      const userName =
        data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : 'User';
      showSuccess(`${userName} created successfully`);
    },
    onError: (error) => {
      showError(
        error instanceof Error ? error.message : 'Failed to create user'
      );
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
      showSuccess(
        `User ${data.firstName} ${data.lastName} updated successfully`
      );
    },
    onError: (error) => {
      showError(
        error instanceof Error ? error.message : 'Failed to update user'
      );
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Get the user from the cache to show their name
      const users = queryClient.getQueryData<User[]>(['users']);
      const deletedUser = users?.find((user) => user.id === variables);
      const userName = deletedUser
        ? `${deletedUser.firstName} ${deletedUser.lastName}`
        : 'User';
      showSuccess(`${userName} deleted successfully`);
    },
    onError: (error) => {
      showError(
        error instanceof Error ? error.message : 'Failed to delete user'
      );
    },
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
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
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        transition: 'background-color 0.3s',
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Avatar
            src="https://images.unsplash.com/photo-1549923746-c502d488b3ea"
            sx={{ width: 40, height: 40, marginRight: 2 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            User Management
          </Typography>
          <IconButton
            color="inherit"
            onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
          >
            <SettingsIcon />
          </IconButton>
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={() => setSettingsAnchorEl(null)}
          >
            <MenuItem>
              <Switch
                checked={mode === 'dark'}
                onChange={toggleTheme}
                inputProps={{ 'aria-label': 'toggle dark mode' }}
              />
              {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
          <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'left' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{ borderRadius: 8, mt: 1, mr: 1 }}
            >
              Add New User
            </Button>
            <Button
              variant="outlined"
              sx={{ borderRadius: 8, mt: 1 }}
              onClick={handleGenerateRandomUser}
            >
              Generate Random User
            </Button>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}
          ></Box>
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
              onSearchChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </Paper>

        {/* User Form Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              p: 2,
            },
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <Box sx={{ p: 2 }}>
            <UserForm
              defaultValues={editingUser || undefined}
              onSubmit={(data) => {
                if (editingUser) {
                  updateMutation.mutate({ ...editingUser, ...data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              isSubmitting={
                createMutation.isPending || updateMutation.isPending
              }
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
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
