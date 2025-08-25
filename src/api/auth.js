import api from './axios';

export const login = async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const signup = async (username, email, password) => {
    return api.post('/auth/signup', { username, email, password });
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};
