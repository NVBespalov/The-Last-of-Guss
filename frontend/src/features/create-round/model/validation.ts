import * as yup from 'yup';

export const roundFormSchema = yup.object().shape({
    name: yup
        .string()
        .required('Название раунда обязательно')
        .min(3, 'Название должно содержать минимум 3 символа')
        .max(50, 'Название не должно превышать 50 символов'),

    description: yup
        .string()
        .optional()
        .default('')
        .max(500, 'Описание не должно превышать 500 символов'),

    startDate: yup
        .string()
        .required('Время начала обязательно')
        .test('future-date', 'Время начала должно быть в будущем', function(value) {
            if (!value) return false;
            const selectedDate = new Date(value);
            const now = new Date();
            return selectedDate > now;
        }),

    duration: yup
        .number()
        .required('Продолжительность обязательна')
        .min(1, 'Минимальная продолжительность - 1 минута')
        .max(1440, 'Максимальная продолжительность - 24 часа'),

    maxParticipants: yup
        .number()
        .optional()
        .default(100)
        .min(1, 'Минимальное количество участников - 1')
        .max(1000, 'Максимальное количество участников - 1000'),
});

export interface RoundFormData {
    name: string;
    description?: string;
    startDate: string;
    duration: number;
    maxParticipants?: number;
}

export interface CreateRoundData {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    maxParticipants?: number;
}