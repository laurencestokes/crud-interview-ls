import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  TableSortLabel,
  Checkbox,
  Button,
  Toolbar,
  alpha,
  styled,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, parseISO, isValid } from 'date-fns';
import { User } from '../types';
import { useState } from 'react';

interface UserTableProps {
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof User;

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.8),
    },
    '& .MuiTableSortLabel-root': {
      color: theme.palette.primary.contrastText,
      '&:hover': {
        color: theme.palette.primary.contrastText,
      },
      '&.Mui-active': {
        color: theme.palette.primary.contrastText,
        '& .MuiTableSortLabel-icon': {
          color: theme.palette.primary.contrastText,
        },
      },
    },
  },
}));

const ResizableTableCell = styled(TableCell)({
  position: 'relative',
  '&:hover .resize-handle': {
    opacity: 1,
  },
});

const ResizeHandle = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: '4px',
  cursor: 'col-resize',
  opacity: 0,
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    opacity: 1,
  },
}));

const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      console.error('Invalid date:', dateString);
      return dateString;
    }
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const UserTable = ({ onEdit, onDelete, isDeleting }: UserTableProps) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('lastName');
  const [selected, setSelected] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    firstName: 150,
    lastName: 150,
    dateOfBirth: 150,
    actions: 100,
  });

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

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = users?.map((n) => n.id) || [];
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = columnWidths[column];

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.pageX - startX);
      if (newWidth > 50) {
        // Minimum width
        setColumnWidths((prev) => ({
          ...prev,
          [column]: newWidth,
        }));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleBulkDelete = () => {
    selected.forEach((id) => onDelete?.(id));
    setSelected([]);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const sortedUsers = users?.slice().sort((a, b) => {
    const aValue = a[orderBy] || '';
    const bValue = b[orderBy] || '';
    if (order === 'asc') {
      return aValue < bValue ? -1 : 1;
    }
    return aValue > bValue ? -1 : 1;
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
    <Box>
      {selected.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
          >
            {selected.length} selected
          </Typography>
          <Button
            color="error"
            variant="contained"
            onClick={handleBulkDelete}
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
          >
            Delete Selected
          </Button>
        </Toolbar>
      )}
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <StyledTableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < (users?.length || 0)
                  }
                  checked={
                    users?.length > 0 && selected.length === users?.length
                  }
                  onChange={handleSelectAllClick}
                  sx={{ color: 'inherit' }}
                />
              </TableCell>
              <ResizableTableCell style={{ width: columnWidths.firstName }}>
                <TableSortLabel
                  active={orderBy === 'firstName'}
                  direction={orderBy === 'firstName' ? order : 'asc'}
                  onClick={() => handleRequestSort('firstName')}
                >
                  First Name
                </TableSortLabel>
                <ResizeHandle
                  className="resize-handle"
                  onMouseDown={(e) => handleResizeStart('firstName', e)}
                />
              </ResizableTableCell>
              <ResizableTableCell style={{ width: columnWidths.lastName }}>
                <TableSortLabel
                  active={orderBy === 'lastName'}
                  direction={orderBy === 'lastName' ? order : 'asc'}
                  onClick={() => handleRequestSort('lastName')}
                >
                  Last Name
                </TableSortLabel>
                <ResizeHandle
                  className="resize-handle"
                  onMouseDown={(e) => handleResizeStart('lastName', e)}
                />
              </ResizableTableCell>
              <ResizableTableCell style={{ width: columnWidths.dateOfBirth }}>
                <TableSortLabel
                  active={orderBy === 'dateOfBirth'}
                  direction={orderBy === 'dateOfBirth' ? order : 'asc'}
                  onClick={() => handleRequestSort('dateOfBirth')}
                >
                  Date of Birth
                </TableSortLabel>
                <ResizeHandle
                  className="resize-handle"
                  onMouseDown={(e) => handleResizeStart('dateOfBirth', e)}
                />
              </ResizableTableCell>
              <TableCell align="right" style={{ width: columnWidths.actions }}>
                Actions
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {sortedUsers?.map((user) => {
              const isItemSelected = isSelected(user.id);
              return (
                <TableRow
                  key={user.id}
                  hover
                  onClick={() => handleClick(user.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemSelected} />
                  </TableCell>
                  <TableCell style={{ width: columnWidths.firstName }}>
                    {user.firstName || ''}
                  </TableCell>
                  <TableCell style={{ width: columnWidths.lastName }}>
                    {user.lastName}
                  </TableCell>
                  <TableCell style={{ width: columnWidths.dateOfBirth }}>
                    {formatDate(user.dateOfBirth)}
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ width: columnWidths.actions }}
                  >
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(user);
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(user.id);
                      }}
                      disabled={isDeleting}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserTable;
