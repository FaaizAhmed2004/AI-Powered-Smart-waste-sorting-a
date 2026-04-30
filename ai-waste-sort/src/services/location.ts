import { restApi } from '../lib/api';

export interface RecyclingCenter {
    id: string;
    name: string;
    address: string;
    distance: string;
    types: string[];
    hours: string;
    phone: string;
    isOpen: boolean;
    location: {
        lat: number;
        lng: number;
    };
    rating?: number;
}

export interface WasteType {
    type: string;
    color: string;
}

export interface LocationResponse {
    success: boolean;
    data: {
        centers: RecyclingCenter[];
        wasteTypes: WasteType[];
    };
}

export interface NearestCentersRequest {
    latitude: number;
    longitude: number;
    radius?: number;
}

export interface NearestCentersResponse {
    success: boolean;
    data: RecyclingCenter[];
}

// Get all recycling centers
export const getRecyclingCenters = async (): Promise<LocationResponse> => {
    const response = await restApi.get('/location/centers');
    return response.data;
};

// Get nearest recycling centers based on user location
export const getNearestRecyclingCenters = async (params: NearestCentersRequest): Promise<NearestCentersResponse> => {
    const response = await restApi.get('/location/nearest', { params });
    return response.data;
};

// Get waste types
export const getWasteTypes = async (): Promise<{ success: boolean; data: WasteType[] }> => {
    const response = await restApi.get('/location/waste-types');
    return response.data;
};