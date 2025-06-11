import { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Alert,
    Stack,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UserFormProps {
    onSubmit?: (user: {
        firstName?: string;
        lastName: string;
        dateOfBirth: string;
    }) => void;
}

const UserForm = ({ onSubmit }: UserFormProps) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [error, setError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const createUser = useMutation({
        mutationFn: async (user: { firstName?: string; lastName: string; dateOfBirth: string }) => {
            const response = await fetch('https://example.com/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                throw new Error('Failed to create user');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setFirstName('');
            setLastName('');
            setDateOfBirth('');
            setError(null);
        },
        onError: () => {
            setError('Failed to create user. Please try again.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!lastName) {
            setError('Last name is required');
            return;
        }

        const selectedDate = new Date(dateOfBirth);
        const today = new Date();
        if (selectedDate > today) {
            setError('Date of birth cannot be in the future');
            return;
        }

        const user = { firstName, lastName, dateOfBirth };
        createUser.mutate(user);
        onSubmit?.(user);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    fullWidth
                    error={!!error && !lastName}
                    helperText={error && !lastName ? 'Last name is required' : ''}
                />

                <TextField
                    label="Date of Birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    fullWidth
                    error={!!(error && dateOfBirth && new Date(dateOfBirth) > new Date())}
                    helperText={
                        error && dateOfBirth && new Date(dateOfBirth) > new Date()
                            ? 'Date of birth cannot be in the future'
                            : ''
                    }
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={createUser.isPending}
                >
                    {createUser.isPending ? 'Creating...' : 'Create User'}
                </Button>
            </Stack>
        </Box>
    );
};

export default UserForm;
