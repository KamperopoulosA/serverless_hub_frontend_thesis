import { useMemo } from 'react';
import { getCurrentUser } from '../api/auth'; // ✅ your existing helper that reads localStorage

const useAuth = () => {
  const user = getCurrentUser();

  const isAuthenticated = !!user?.token;

  // Extract role from token or response payload
  const role = useMemo(() => {
    try {
      // If backend returns role directly (preferred)
      if (user?.ourUsers?.role) {
        return user.ourUsers.role.toUpperCase();
      }

      // If stored in token payload
      const token = user?.token;
      if (token) {
        const [, payloadBase64] = token.split('.');
        const payload = JSON.parse(atob(payloadBase64));
        if (payload?.role) {
          return payload.role.toUpperCase();
        }
      }

      return null;
    } catch (e) {
      console.error('Error parsing role from token', e);
      return null;
    }
  }, [user]);

  return {
    user,
    isAuthenticated,
    isAdmin: role === 'ADMIN',
    role,
  };
};

export default useAuth;
