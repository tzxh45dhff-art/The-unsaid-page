import { createContext, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Dark is the only theme — apply once on mount and never change
    useEffect(() => {
        document.body.classList.add('dark');
        localStorage.setItem('unsaid-theme', 'dark');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
