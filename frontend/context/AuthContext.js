import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('doctor');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error loading auth from storage', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const refreshAuth = async () => {
    await loadStoredAuth();
  };

  const signIn = async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('doctor', JSON.stringify(res.data.doctor));
    setToken(res.data.token);
    setUser(res.data.doctor);
  };

  const signUp = async (formData) => {
    const res = await api.post('/auth/signup', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('doctor', JSON.stringify(res.data.doctor));
    setToken(res.data.token);
    setUser(res.data.doctor);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('doctor');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};