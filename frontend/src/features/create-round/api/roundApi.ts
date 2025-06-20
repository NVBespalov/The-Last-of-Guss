import axios from 'axios';
import type { Round } from '@entities/round';
import type { CreateRoundData } from '@/features';
import {env} from "@/shared";

export const roundApi = {
    createRound: async (data: CreateRoundData): Promise<Round> => {
        const response = await axios.post(`${env.API_BASE_URL}/rounds`, data);
        return response.data;
    },
};