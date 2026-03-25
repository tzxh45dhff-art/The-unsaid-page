import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../api/auth';
import { completeRead } from '../api/posts';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [points, setPoints] = useState(() => {
        const savedPoints = localStorage.getItem('unsaid-points');
        return savedPoints ? parseInt(savedPoints, 10) : 0;
    });
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const token = localStorage.getItem('unsaid-token');
        if (token) {
            getMe()
                .then((userData) => {
                    setUser(userData);
                    setPoints(userData.sanctuary_points || 0);
                })
                .catch(() => {
                    localStorage.removeItem('unsaid-token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('unsaid-points', points.toString());
    }, [points]);

    const login = async (email, password) => {
        const { user: userData, token } = await loginUser(email, password);
        localStorage.setItem('unsaid-token', token);
        setUser(userData);
        setPoints(userData.sanctuary_points || 0);
        return userData;
    };

    const register = async ({ email, username, password, display_name }) => {
        const { user: userData, token } = await registerUser({ email, username, password, display_name });
        localStorage.setItem('unsaid-token', token);
        setUser(userData);
        setPoints(userData.sanctuary_points || 0);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('unsaid-token');
        localStorage.removeItem('unsaid-points');
        setUser(null);
        setPoints(0);
    };

    const addPoints = (amount) => {
        setPoints((prev) => prev + amount);
    };

    const isAuthenticated = !!user;
    
    const awardReadingPoints = useCallback(async (postId) => {
        if (!isAuthenticated || !postId) return { awarded: false };
        const result = await completeRead(postId);
        if (result.awarded && result.points) addPoints(result.points);
        return result;
    }, [isAuthenticated]);

    return (
        <UserContext.Provider value={{
            user, points, loading, isAuthenticated,
            login, register, logout,
            addPoints, awardReadingPoints,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
