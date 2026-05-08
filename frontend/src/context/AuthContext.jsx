import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('kantin_token'));
  const [username, setUsername] = useState(() => localStorage.getItem('kantin_user'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('kantin_token', token);
    } else {
      localStorage.removeItem('kantin_token');
    }
  }, [token]);

  useEffect(() => {
    if (username) {
      localStorage.setItem('kantin_user', username);
    } else {
      localStorage.removeItem('kantin_user');
    }
  }, [username]);

  return (
    <AuthContext.Provider value={{ token, setToken, username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
