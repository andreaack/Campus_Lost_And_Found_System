import API from './axiosInstance';

export const submitClaim = async (claimData) => {
    try {
        const { data } = await API.post('/claims', claimData);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to submit claim." };
    }
};

export const getAllClaims = async () => {
    try {
        const { data } = await API.get('/claims');
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch claims." };
    }
};

export const approveClaim = async (id, adminNote = '') => {
    try {
        const { data } = await API.put(`/claims/${id}/approve`, { adminNote });
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to approve claim." };
    }
};

export const rejectClaim = async (id, adminNote = '') => {
    try {
        const { data } = await API.put(`/claims/${id}/reject`, { adminNote });
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to reject claim." };
    }
};

// Backward-compat shim
export const updateClaimStatus = async (id, status, adminNote = '') => {
    if (status === 'approved') return approveClaim(id, adminNote);
    if (status === 'rejected') return rejectClaim(id, adminNote);
    throw { message: `Unsupported claim status: ${status}` };
};

export const getUserClaims = async (userId) => {
    try {
        const { data } = await API.get(`/claims/user/${userId}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch your claims." };
    }
};

export const getClaimsForItem = async (itemId) => {
    try {
        const { data } = await API.get(`/claims/item/${itemId}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch item claims." };
    }
};

export const getClaimById = async (id) => {
    try {
        const { data } = await API.get(`/claims/${id}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch claim." };
    }
};

export const deleteClaim = async (id) => {
    try {
        const { data } = await API.delete(`/claims/${id}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete claim." };
    }
};
