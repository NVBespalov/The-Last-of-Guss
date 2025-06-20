import * as yup from 'yup'

export const loginSchema = yup.object({
    username: yup
        .string()
        .required('Имя пользователя обязательно')
        .min(2, 'Минимум 2 символа')
        .max(50, 'Максимум 50 символов'),
    password: yup
        .string()
        .required('Пароль обязателен')
        .min(4, 'Минимум 4 символа')
        .max(100, 'Максимум 100 символов'),
})

export type LoginFormData = yup.InferType<typeof loginSchema>