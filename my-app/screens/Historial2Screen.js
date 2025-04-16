import { View, StyleSheet } from "react-native";
import Sidebar from "./SidebarScreenWeb";
import { Card, Text, Button, Avatar } from "react-native-paper";
import { useRoute } from '@react-navigation/native';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import React, { useContext, useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Image } from 'react-native';


export const enviarActividad = async (actividad) => {
    try {
      // const idUser = 'prueba'
      const idUser = await storage.get(STORAGE_KEYS.USER);
      const fecha = new Date().toISOString();
  
      const response = await fetch(`${API_CONFIG.BASE_URL}/historial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUser,
          fecha,
          actividad,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error al enviar la actividad');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error en enviarActividad:', error);
      throw error;
    }
  };