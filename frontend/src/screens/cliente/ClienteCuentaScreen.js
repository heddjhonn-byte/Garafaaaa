import React, { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import InfoRow from '../../components/molecules/InfoRow';
import InlineNotice from '../../components/molecules/InlineNotice';
import PageTemplate from '../../components/templates/PageTemplate';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

const ALERTS_KEY = 'garrafaya.nearby-alerts';

export default function ClienteCuentaScreen() {
  const { user, signOut } = useAuth();
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(ALERTS_KEY)
      .then((value) => {
        if (active) setAlertsEnabled(value === 'true');
      })
      .catch((storageError) => {
        if (active) setError(`No se pudo leer la preferencia de alertas: ${storageError.message}`);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function toggleAlerts(value) {
    setError('');
    try {
      await AsyncStorage.setItem(ALERTS_KEY, String(value));
      setAlertsEnabled(value);
    } catch (storageError) {
      setError(`No se pudo guardar la preferencia: ${storageError.message}`);
    }
  }

  return (
    <PageTemplate title="Mi cuenta" subtitle="Perfil y preferencias personales">
      <InlineNotice message={error} />
      <SurfaceCard>
        <AppText variant="heading">{user.nombre}</AppText>
        <InfoRow label="Perfil" value={user.rol} />
        <InfoRow label="Correo" value={user.email} />
        <InfoRow label="CI" value={user.ci || '—'} />
        <InfoRow label="Teléfono" value={user.telefono || '—'} />
      </SurfaceCard>
      <SurfaceCard>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText variant="heading">Alertas de cercanía</AppText>
            <AppText variant="caption" style={{ marginTop: 5 }}>Guarda tu preferencia para avisos locales.</AppText>
          </View>
          <Switch
            value={alertsEnabled}
            onValueChange={toggleAlerts}
            disabled={!ready}
            trackColor={{ true: colors.primary, false: '#CBD5E1' }}
          />
        </View>
      </SurfaceCard>
      <PrimaryButton title="Cerrar sesión" secondary onPress={signOut} />
    </PageTemplate>
  );
}
