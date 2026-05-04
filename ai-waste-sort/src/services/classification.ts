import { aiApi, restApi } from '../lib/api';

export interface DetectionResult {
    label: string;
    confidence: number;
    bbox: [number, number, number, number]; // [x1, y1, x2, y2]
    areaRatio?: number;
}

export interface ClassificationResult {
    detections: DetectionResult[];
    count: number;
}

export interface ClassificationRecord {
    _id: string;
    userId: string;
    imageUrl: string;
    label: string;
    confidence: number;
    createdAt: string;
    updatedAt: string;
}

// AI Classification (direct to Python model)
export const classifyImage = async (file: File | Blob, filename = 'capture.jpg'): Promise<ClassificationResult> => {
    const formData = new FormData();
    formData.append('file', file, file instanceof File ? file.name : filename);
    
    try {
        const response = await aiApi.post('/scan', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 second timeout for AI processing
        });
        
        return response.data;
    } catch (error: any) {
        console.error('AI Classification error:', error);
        
        if (error.code === 'ECONNREFUSED') {
            throw new Error('AI service is not available. Please make sure the Python server is running on port 8000.');
        }
        
        if (error.response?.status === 400) {
            throw new Error('Invalid image format. Please upload a valid image file.');
        }
        
        if (error.response?.status === 500) {
            throw new Error('AI model processing failed. Please try again.');
        }
        
        throw new Error('Classification failed. Please check your connection and try again.');
    }
};

// REST API Classification (with database storage)
export const classifyAndSaveImage = async (imageUrl: string, label: string, confidence: number): Promise<ClassificationRecord> => {
    try {
        const response = await restApi.post('/classification/classify', {
            imageUrl,
            label,
            confidence
        });
        
        return response.data.data;
    } catch (error: any) {
        console.error('Save classification error:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please log in again.');
        }
        
        if (error.response?.status === 400) {
            throw new Error('Invalid classification data.');
        }
        
        throw new Error('Failed to save classification. Please try again.');
    }
};

// Get user classification history
export const getUserClassifications = async (userId: string): Promise<ClassificationRecord[]> => {
    try {
        const response = await restApi.get(`/classification/classify/history/${userId}`);
        return response.data.data || [];
    } catch (error: any) {
        console.error('Get classifications error:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please log in again.');
        }
        
        if (error.response?.status === 404) {
            return []; // Return empty array if no history found
        }
        
        throw new Error('Failed to load classification history.');
    }
};

// Delete classification record
export const deleteClassification = async (id: string): Promise<void> => {
    try {
        await restApi.delete(`/classification/classify/${id}`);
    } catch (error: any) {
        console.error('Delete classification error:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Authentication required. Please log in again.');
        }
        
        if (error.response?.status === 404) {
            throw new Error('Classification record not found.');
        }
        
        throw new Error('Failed to delete classification.');
    }
};
