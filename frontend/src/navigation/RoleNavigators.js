import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminCamionesScreen from '../screens/admin/AdminCamionesScreen';
import AdminRutasScreen from '../screens/admin/AdminRutasScreen';
import AdminGarrafasScreen from '../screens/admin/AdminGarrafasScreen';
import AdminUsuariosScreen from '../screens/admin/AdminUsuariosScreen';
import CamioneroRutaScreen from '../screens/camionero/CamioneroRutaScreen';
import CamioneroGpsScreen from '../screens/camionero/CamioneroGpsScreen';
import CamioneroIncidentesScreen from '../screens/camionero/CamioneroIncidentesScreen';
import CamioneroPerfilScreen from '../screens/camionero/CamioneroPerfilScreen';
import ClienteInicioScreen from '../screens/cliente/ClienteInicioScreen';
import ClienteCamionScreen from '../screens/cliente/ClienteCamionScreen';
import ClienteNoticiasScreen from '../screens/cliente/ClienteNoticiasScreen';
import ClienteHistorialScreen from '../screens/cliente/ClienteHistorialScreen';
import ClienteCuentaScreen from '../screens/cliente/ClienteCuentaScreen';

const Tab = createBottomTabNavigator();
const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.muted,
  tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
  tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: colors.border, height: 62, paddingBottom: 7, paddingTop: 6 },
};

function RoleTabs({ children }) {
  return <Tab.Navigator screenOptions={tabScreenOptions}>{children}</Tab.Navigator>;
}

export function AdminNavigator() {
  return (
    <RoleTabs>
      <Tab.Screen name="Inicio" component={AdminDashboardScreen} />
      <Tab.Screen name="Camiones" component={AdminCamionesScreen} />
      <Tab.Screen name="Rutas" component={AdminRutasScreen} />
      <Tab.Screen name="Garrafas" component={AdminGarrafasScreen} />
      <Tab.Screen name="Usuarios" component={AdminUsuariosScreen} />
    </RoleTabs>
  );
}

export function CamioneroNavigator() {
  return (
    <RoleTabs>
      <Tab.Screen name="Mi ruta" component={CamioneroRutaScreen} />
      <Tab.Screen name="GPS" component={CamioneroGpsScreen} />
      <Tab.Screen name="Incidentes" component={CamioneroIncidentesScreen} />
      <Tab.Screen name="Perfil" component={CamioneroPerfilScreen} />
    </RoleTabs>
  );
}

export function ClienteNavigator() {
  return (
    <RoleTabs>
      <Tab.Screen name="Inicio" component={ClienteInicioScreen} />
      <Tab.Screen name="Mi camión" component={ClienteCamionScreen} />
      <Tab.Screen name="Noticias" component={ClienteNoticiasScreen} />
      <Tab.Screen name="Historial" component={ClienteHistorialScreen} />
      <Tab.Screen name="Mi cuenta" component={ClienteCuentaScreen} />
    </RoleTabs>
  );
}
