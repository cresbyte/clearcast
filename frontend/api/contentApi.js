import axios from './axios';
import { useQuery } from '@tanstack/react-query';

export const contentApi = {
    getHeroSections: async () => {
        const response = await axios.get('/reviews/hero/');
        return response.data;
    },
    getNavbarPromos: async () => {
        const response = await axios.get('/reviews/promo/');
        return response.data;
    },
    getContentSections: async () => {
        const response = await axios.get('/reviews/content/');
        return response.data;
    },
    getShopByCatalogSections: async () => {
        const response = await axios.get('/reviews/shop-by-catalog/');
        return response.data;
    },
    deleteHero: async (id) => {
        await axios.delete(`/reviews/hero/${id}/`);
    },
    createHero: async (data) => {
        const response = await axios.post('/reviews/hero/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    updateHero: async (id, data) => {
        const response = await axios.patch(`/reviews/hero/${id}/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deletePromo: async (id) => {
        await axios.delete(`/reviews/promo/${id}/`);
    },
    createPromo: async (data) => {
        const response = await axios.post('/reviews/promo/', data);
        return response.data;
    },
    updatePromo: async (id, data) => {
        const response = await axios.patch(`/reviews/promo/${id}/`, data);
        return response.data;
    },
    deleteContent: async (id) => {
        await axios.delete(`/reviews/content/${id}/`);
    },
    createContent: async (data) => {
        const response = await axios.post('/reviews/content/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    updateContent: async (id, data) => {
        const response = await axios.patch(`/reviews/content/${id}/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deleteShopByCatalogSection: async (id) => {
        await axios.delete(`/reviews/shop-by-catalog/${id}/`);
    },
    createShopByCatalogSection: async (data) => {
        const response = await axios.post('/reviews/shop-by-catalog/', data);
        return response.data;
    },
    updateShopByCatalogSection: async (id, data) => {
        const response = await axios.patch(`/reviews/shop-by-catalog/${id}/`, data);
        return response.data;
    },
};

export const useHeroSections = () => {
    return useQuery({
        queryKey: ['hero-sections'],
        queryFn: contentApi.getHeroSections
    });
};

export const useNavbarPromos = () => {
    return useQuery({
        queryKey: ['navbar-promos'],
        queryFn: contentApi.getNavbarPromos
    });
};

export const useContentSections = () => {
    return useQuery({
        queryKey: ['content-sections'],
        queryFn: contentApi.getContentSections
    });
};

export const useShopByCatalogSections = () => {
    return useQuery({
        queryKey: ['shop-by-catalog'],
        queryFn: contentApi.getShopByCatalogSections,
    });
};
