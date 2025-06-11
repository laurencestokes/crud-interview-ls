import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

interface UserFormProps {
    onSubmit: (user: { firstName?: string; lastName: string; dateOfBirth: string }) => void;
    initialValues?: { firstName?: string; lastName: string; dateOfBirth: string };
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialValues }) => {
    const [firstName, setFirstName] = useState(initialValues?.firstName || '');
    const [lastName, setLastName] = useState(initialValues?.lastName || '');
    const [dateOfBirth, setDateOfBirth] = useState(initialValues?.dateOfBirth || '');
    const [errors, setErrors] = useState<{ lastName?: string; dateOfBirth?: string }>({});

    const validate = () => {
        const newErrors: { lastName?: string; dateOfBirth?: string } = {};
        if (!lastName) {
            newErrors.lastName = 'Last name is required';
        }
        if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
            newErrors.dateOfBirth = 'Date of birth cannot be in the future';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({ firstName, lastName, dateOfBirth });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
                margin="normal"
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                {initialValues ? 'Update User' : 'Create User'}
            </Button>
        </Box>
    );
};

export default UserForm; 