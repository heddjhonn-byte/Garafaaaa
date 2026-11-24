import React, { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import InfoRow from '../../components/molecules/InfoRow';
import InlineNotice from '../../components/molecules/InlineNotice';
import LoadingState from '../../components/organisms/LoadingState';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import { getErrorMessage } from '../../hooks/useApiResource';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

export default function CamioneroGpsScreen() {
  const { user } = useAuth();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);

  const loadTruck = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/camiones');
      setTruck(data.camiones.find((item) => item.camionero_id === user.id) || null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadTruck();
  }, [loadTruck]);

  const sendCoordinates = useCallback(async (coords) => {
    if (!truck) throw new Error('No hay un camión asignado a tu cuenta.');
    setSending(true);
    setError('');
    try {
      const { data } = await api.patch(`/camiones/${truck.id}/ubicacion`, {
        latitud: coords.latitude,
        longitud: coords.longitude,
        ubicacion: 'Ubicación GPS en vivo',
      });
      setLocation({ ...coords, updatedAt: data.camion.ultima_ubicacion_at });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      throw requestError;
    } finally {
      setSending(false);
    }
  }, [truck]);

  async function sendCurrentLocation() {
    setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Se requiere permiso de ubicación para enviar el GPS.');
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await sendCoordinates(current.coords);
    } catch (locationError) {
      setError(getErrorMessage(locationError));
    }
  }

  useEffect(() => {
    let cancelled = false;
    let subscription;
    async function startTracking() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Se requiere permiso de ubicación para activar el seguimiento.');
      const watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 25 },
        (position) => sendCoordinates(position.coords).catch(() => {}),
      );
      if (cancelled) watcher.remove();
      else subscription = watcher;
    }
    if (tracking && truck) {
      startTracking().catch((trackingError) => {
        if (!cancelled) {
          setError(getErrorMessage(trackingError));
          setTracking(false);
        }
      });
    }
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [tracking, truck, sendCoordinates]);

  return (
    <PageTemplate title="GPS del camión" subtitle="Comparte la ubicación actual con los clientes" onRefresh={loadTruck} refreshing={loading}>
      <InlineNotice message={error} />
      {loading ? <LoadingState /> : null}
      {truck ? (
        <SurfaceCard>
          <AppText variant="heading">{truck.placa}</AppText>
          <InfoRow label="Camionero asignado" value={user.nombre} />
          <InfoRow label="Última ubicación" value={truck.ubicacion || 'Sin actualizar'} />
          {location ? <InfoRow label="GPS actual" value={`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`} /> : null}
          <PrimaryButton title={sending ? 'Enviando...' : 'Enviar ubicación actual'} onPress={sendCurrentLocation} loading={sending} style={{ marginTop: 12 }} />
          <PrimaryButton
            title={tracking ? 'Detener seguimiento en vivo' : 'Activar seguimiento en vivo'}
            secondary
            onPress={() => setTracking((value) => !value)}
            style={{ marginTop: 8 }}
          />
          <AppText variant="caption" color={colors.muted} style={{ marginTop: 10 }}>
            El seguimiento actualiza el servidor cada 15 segundos o al desplazarte 25 metros.
          </AppText>
        </SurfaceCard>
      ) : !loading ? (
        <SurfaceCard><AppText>No hay un camión asignado a tu cuenta. Contacta a Administración.</AppText></SurfaceCard>
      ) : null}
    </PageTemplate>
  );
}
