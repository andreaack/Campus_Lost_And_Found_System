import API from './axiosInstance';

export const loginUser = async (credentials) => {
    try {
        const { data } = await API.post('/auth/login', credentials);
        return data; 
    } catch (error) {
        if (error.code === 'ERR_NETWORK') throw error;
        throw error.response?.data || { message: "Server error, try again later." };
    }
};

export const signupUser = async (userData) => {
    try {
        const { data } = await API.post('/auth/register', userData);
        return data;
    } catch (error) {
        if (error.code === 'ERR_NETWORK') throw error;
        throw error.response?.data || { message: "Signup failed." };
    }
};

export const getMe = async () => {
    try {
        const { data } = await API.get('/auth/me');
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch user data." };
    }
};

export const logout = async () => {
    try {
        const { data } = await API.post('/auth/logout');
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Logout failed." };
    }
};




export const getAllUsers = async () => {
    try {
        const { data } = await API.get('/users'); 
        
        return data; 
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch users." };
    }
};


export const removeUser = async (userId) => {
    try {
        const { data } = await API.delete(`/users/${userId}`);
      
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete user." };
    }
};