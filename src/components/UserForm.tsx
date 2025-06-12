import { z } from 'zod';
import { useForm } from 'react-hook-form';
import {
    TextField,
    Button,
    Alert,
    Stack,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

const userSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z
        .string()
        .min(1, 'Date of birth is required')
        .refine(
            (val) => {
                if (!val) return false;
                const selectedDate = new Date(val);
                const today = new Date();
                return selectedDate <= today;
            },
            { message: 'Date of birth cannot be in the future' }
        ),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    onSubmit?: (user: UserFormValues) => void;
    defaultValues?: Partial<UserFormValues>;
}

const UserForm = ({ onSubmit, defaultValues }: UserFormProps) => {

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        mode: 'onSubmit',
        defaultValues: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            ...defaultValues,
        },
    });

    useEffect(() => {
        reset({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            ...defaultValues,
        });
    }, [defaultValues, reset]);

    const onFormSubmit = (data: UserFormValues) => {
        onSubmit?.(data);
    };

    console.log(errors);
    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
            <Stack spacing={3}>
                {errors.root && <Alert severity="error">{errors.root.message}</Alert>}

                <TextField
                    label="First Name"
                    {...register('firstName')}
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                />

                <TextField
                    label="Last Name"
                    {...register('lastName')}
                    required
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                />

                <TextField
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth')}
                    required
                    fullWidth
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth?.message}
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? (defaultValues && defaultValues.lastName ? 'Saving...' : 'Creating...')
                        : (defaultValues && defaultValues.lastName ? 'Save' : 'Create User')}
                </Button>
            </Stack>
        </form>
    );
};

export default UserForm;
