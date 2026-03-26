import { useMutation, useQuery } from '@tanstack/react-query';
import api from './axios';

/**
 * Send a contact message to the backend
 * @param {FormData | Object} messageData - The contact form data
 * @param {string} messageData.name - Sender's name
 * @param {string} messageData.email - Sender's email
 * @param {string} [messageData.phone_number] - Sender's phone number
 * @param {string} messageData.subject - Message subject
 * @param {string} messageData.message - Message content
 */
export const sendContactMessage = async (messageData) => {
    const response = await api.post('contact-messages/', messageData);
    return response.data;
};

/**
 * Hook for sending a contact message
 */
export const useSendContactMessage = () => {
    return useMutation({
        mutationFn: sendContactMessage,
    });
};

/**
 * Fetch all contact messages (Admin only)
 */
export const fetchContactMessages = async () => {
    const response = await api.get('contact-messages/');
    return response.data;
};

/**
 * Hook for fetching contact messages
 */
export const useContactMessages = () => {
    return useQuery({
        queryKey: ['contact-messages'],
        queryFn: fetchContactMessages,
    });
};
