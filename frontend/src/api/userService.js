import API from './axiosInstance';

export const getAllUsers = async () => {
    try {
        const { data } = await API.get('/users');
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch users." };
    }
};

export const getUserById = async (id) => {
    try {
        const { data } = await API.get(`/users/${id}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch user." };
    }
};

export const updateUser = async (id, payload) => {
    try {
        const { data } = await API.put(`/users/${id}`, payload);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update user." };
    }
};

export const deleteUser = async (id) => {
    try {
        const { data } = await API.delete(`/users/${id}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete user." };
    }
};
