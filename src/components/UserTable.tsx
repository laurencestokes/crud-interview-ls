import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, CircularProgress, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../types';
import { formatDate } from '../utils/date';
import { fetchUsers } from '../api/users';

interface UserTableProps {
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  searchTerm?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UserTable = ({
  onEdit,
  onDelete,
  isDeleting,
  searchTerm = '',
}: UserTableProps) => {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First Name', flex: 1, minWidth: 120 },
    { field: 'lastName', headerName: 'Last Name', flex: 1, minWidth: 120 },
    {
      field: 'dateOfBirth',
      headerName: 'Date of Birth',
      flex: 1,
      minWidth: 140,
      valueFormatter: (params: string) => formatDate(params as string),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      resizable: false,
      disableColumnMenu: true,
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            data-testid={`edit-user-${params.row.id}`}
            color="primary"
            onClick={() => onEdit?.(params.row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            data-testid={`delete-user-${params.row.id}`}
            color="error"
            onClick={() => onDelete?.(params.row.id)}
            disabled={isDeleting}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">Failed to load users. Please try again.</Alert>
    );
  }

  if (!users?.length) {
    return (
      <Box p={2}>
        <Alert severity="info">No users found. Create your first user!</Alert>
      </Box>
    );
  }

  // Filter users by search term
  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', flexGrow: 1, height: '100%' }}>
      <DataGrid
        rows={filteredUsers}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'primary.main',
            fontSize: 14,
            borderBottom: '2px solid #1976d2',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
        }}
      />
    </Box>
  );
};

export default UserTable;
