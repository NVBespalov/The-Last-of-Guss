import type {Round} from '@entities/round';
import type {CreateRoundData} from '@/features';
import {apiClient} from "@/shared";

export const roundApi = {
    createRound: async (data: CreateRoundData): Promise<Round> => {
        const response = await apiClient.post(`/rounds`, data);
        return response.data;
    },
};