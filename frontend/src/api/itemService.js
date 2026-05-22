import API from './axiosInstance';


export const getItems = async (filters) => {
    try {
        const { search, category, location, status, start, end } = filters;
        const cat = category === "All Categories" ? "" : category;
        const loc = location === "All Locations" ? "" : location;
        const stat = status === "All Status" ? "" : status.toLowerCase();

        if (search && search.trim()) {
            const params = new URLSearchParams();
            params.append('q', search.trim());
            if (cat) params.append('category', cat);
            if (loc) params.append('location', loc);
            const { data } = await API.get(`/items/search?${params}`);
            return data;
        }
        const params = new URLSearchParams();
        if (cat) params.append('category', cat);
        if (loc) params.append('location', loc);
        if (stat) params.append('status', stat);
        if (start) params.append('start', start);
        if (end) params.append('end', end);
        const { data } = await API.get(`/items?${params}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch items." };
    }
};


export const createItem = async (itemData) => {
    try {
        const { data } = await API.post('/items', itemData);
        return data;
    } catch (error) {
        const errData = error.response?.data;
        throw { message: errData?.error?.message || errData?.message || "Failed to submit report." };
    }
};


export const getMyItems = async () => {
    try {
        const { data } = await API.get('/items/mine');
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch my items." };
    }
};

export const getAllItems = async () => {
    try {
        const { data } = await API.get('/items');
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch items." };
    }
};

export const getAllItemsForAdmin = async () => {
    try {
        const { data } = await API.get('/items/admin/all');
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch items." };
    }
};

export const updateItemStatus = async (itemId, status) => {
    try {
        const { data } = await API.patch(`/items/${itemId}/status`, { status });
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update item status." };
    }
};

export const deleteItem = async (itemId) => {
    try {
        const { data } = await API.delete(`/items/${itemId}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete item." };
    }
};

export const searchItems = async (q) => {
    try {
        const { data } = await API.get(`/items/search?q=${encodeURIComponent(q)}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Search failed." };
    }
};

export const filterItems = async (params = {}) => {
    try {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '' && !String(v).toLowerCase().startsWith('all')) {
                qs.append(k, v);
            }
        });
        const { data } = await API.get(`/items/filter?${qs.toString()}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Filter failed." };
    }
};

export const getItemById = async (id) => {
    try {
        const { data } = await API.get(`/items/${id}`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch item." };
    }
};

export const updateItem = async (id, payload) => {
    try {
        const { data } = await API.put(`/items/${id}`, payload);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update item." };
    }
};

export const markRecovered = async (id) => {
    try {
        const { data } = await API.put(`/items/${id}/mark-recovered`);
        return data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to mark recovered." };
    }
};