import * as yup from 'yup';

export const roundFormSchema = yup.object().shape({
    startTime: yup
        .string()
        .required('Время начала обязательно')
        .test('future-date', 'Время начала должно быть в будущем', function (value) {
            if (!value) return false;
            const selectedDate = new Date(value);
            const now = new Date();
            return selectedDate > now;
        }),
    duration: yup
        .number()
        .required('Продолжительность обязательна')
        .min(1, 'Минимальная продолжительность - 1 минута')
        .max(1440, 'Максимальная продолжительность - 24 часа')
        .test('max-duration', 'Продолжительность не должна превышать 24 часа', function (value) {
            if (!value) return false;
            return value <= 1440;
        }),
});

export interface RoundFormData {
    startTime: string;
    duration: number;
}

export interface CreateRoundData {
    startTime: string;
    duration: number;
}