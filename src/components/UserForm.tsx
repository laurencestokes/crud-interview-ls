import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Alert, Stack } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isValid, parseISO } from 'date-fns';

const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => {
        if (!val) return false;
        const date = parseISO(val);
        return isValid(date) && date <= new Date();
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
    setError,
    trigger,
    control,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
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

  const onFormSubmit = async (data: UserFormValues) => {
    try {
      await onSubmit?.(data);
    } catch (error) {
      setError('root', {
        message: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

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
          {...register('lastName', {
            onChange: () => trigger('lastName'),
          })}
          required
          fullWidth
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Birth"
                value={field.value ? parseISO(field.value) : null}
                onChange={(date) => {
                  field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                  trigger('dateOfBirth');
                }}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth?.message,
                  },
                }}
                maxDate={new Date()}
              />
            </LocalizationProvider>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? defaultValues && defaultValues.lastName
              ? 'Saving...'
              : 'Creating...'
            : defaultValues && defaultValues.lastName
              ? 'Save'
              : 'Create User'}
        </Button>
      </Stack>
    </form>
  );
};

export default UserForm;
