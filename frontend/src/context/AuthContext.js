import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { getErrorMessage } from '../hooks/useApiResource';

const AuthContext = createContext(null);
const TOKEN_KEY = 'garrafaya.token';
const USER_KEY = 'garrafaya.user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState('');

  const clearSession = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) return;
        const cachedUser = await AsyncStorage.getItem(USER_KEY);
        if (active && cachedUser) setUser(JSON.parse(cachedUser));
        try {
          const { data } = await api.get('/auth/me');
          if (active) {
            setUser(data.usuario);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
          }
        } catch (requestError) {
          if (requestError?.response?.status === 401) {
            await clearSession();
          } else if (active) {
            setRestoreError(getErrorMessage(requestError));
          }
        }
      } catch (storageError) {
        if (active) setRestoreError(getErrorMessage(storageError));
      } finally {
        if (active) setLoading(false);
      }
    }
    restoreSession();
    return () => {
      active = false;
    };
  }, [clearSession]);

  const signIn = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
    await AsyncStorage.multiSet([
      [TOKEN_KEY, data.token],
      [USER_KEY, JSON.stringify(data.usuario)],
    ]);
    setUser(data.usuario);
    setRestoreError('');
    return data.usuario;
  }, []);

  const register = useCallback(async (details) => {
    await api.post('/auth/register', { ...details, rol: 'Cliente' });
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, restoreError, signIn, register, signOut }),
    [user, loading, restoreError, signIn, register, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return value;
}
