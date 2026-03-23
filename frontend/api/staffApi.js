import axios from "./axios";

export const getStaffList = async () => {
    const response = await axios.get("admin/staff/");
    if (response.data.results) {
        return response.data.results;
    }
    return response.data;
};

export const getStaffDetails = async (id) => {
    const response = await axios.get(`admin/staff/${id}/`);
    return response.data;
};

export const registerStaff = async (data) => {
    const response = await axios.post(`admin/staff/`, data);
    return response.data;
};

export const updateStaff = async (id, data) => {
    const response = await axios.patch(`admin/staff/${id}/`, data);
    return response.data;
};

export const deleteStaff = async (id) => {
    const response = await axios.delete(`admin/staff/${id}/`);
    return response.data;
};
