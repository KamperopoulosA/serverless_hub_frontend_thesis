import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [credentials, setCredentials] = useState({});

    const updateCredentials = (newCredentials) => {
        setCredentials(prev => ({ ...prev, ...newCredentials }));
    };

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            credentials,
            updateCredentials
        }}>
            {children}
        </UserContext.Provider>
    );
};