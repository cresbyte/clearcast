import api from './axios';

/**
 * Fetch current email configuration
 */
export const fetchEmailSettings = async () => {
    const response = await api.get('admin/email-settings/current/');
    return response.data;
};

/**
 * Update email configuration
 */
export const updateEmailSettings = async (data) => {
    const response = await api.patch('admin/email-settings/current/', data);
    return response.data;
};
/**
 * Test SMTP connection with provided settings
 */
export const testEmailConnection = async (data) => {
    const response = await api.post('admin/email-settings/test_connection/', data);
    return response.data;
};
