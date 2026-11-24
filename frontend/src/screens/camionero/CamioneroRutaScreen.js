import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import StatusBadge from '../../components/atoms/StatusBadge';
import InfoRow from '../../components/molecules/InfoRow';
import InlineNotice from '../../components/molecules/InlineNotice';
import LoadingState from '../../components/organisms/LoadingState';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource, { getErrorMessage } from '../../hooks/useApiResource';

export default function CamioneroRutaScreen() {
  const [busy, setBusy] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [notice, setNotice] = useState('');
  const loader = useCallback(async () => {
    const { data } = await api.get('/rutas/mi-ruta');
    return data.ruta;
  }, []);
  const resource = useApiResource(loader);
  const route = resource.data;

  async function updateProgress(finalizar) {
    if (!route) return;
    setBusy(true);
    setErrorNotice('');
    setNotice('');
    try {
      const { data } = await api.patch(`/rutas/${route.id}/progreso`, {
        garrafas_entregadas: route.garrafas_entregadas + (finalizar ? 0 : 1),
        finalizar,
      });
      resource.setData(data.ruta);
      setNotice(finalizar ? 'Ruta finalizada.' : 'Entrega registrada.');
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  const isActive = route?.estado === 'ACTIVA';
  const remaining = route ? route.garrafas_iniciales - route.garrafas_entregadas : 0;

  return (
    <PageTemplate title="Mi ruta" subtitle="Ruta activa asignada para La Paz y El Alto" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error || errorNotice} />
      <InlineNotice message={notice} type="success" />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      {route ? (
        <SurfaceCard>
          <AppText variant="heading">{route.placa} · {route.zona_nombre}</AppText>
          <AppText variant="caption" style={{ marginTop: 4 }}>{route.ciudad}</AppText>
          <StatusBadge label={route.estado} tone={isActive ? 'success' : 'neutral'} />
          <InfoRow label="Capacidad" value={`${route.capacidad_kg} kg`} />
          <InfoRow label="Garrafas iniciales" value={route.garrafas_iniciales} />
          <InfoRow label="Entregadas" value={route.garrafas_entregadas} />
          <InfoRow label="Stock en camión" value={remaining} />
          <View style={{ gap: 8, marginTop: 12 }}>
            <PrimaryButton title="+1 Entregada" onPress={() => updateProgress(false)} loading={busy} disabled={!isActive || remaining <= 0} />
            <PrimaryButton title="Finalizar Ruta" secondary onPress={() => updateProgress(true)} disabled={!isActive} />
          </View>
        </SurfaceCard>
      ) : (
        <SurfaceCard>
          <AppText variant="heading">No tienes una ruta activa</AppText>
          <AppText style={{ marginTop: 6 }}>Cuando Administración registre una salida, la ruta aparecerá aquí.</AppText>
        </SurfaceCard>
      )}
      <AppText variant="caption">El progreso se guarda en el servidor y actualiza el stock restante del camión.</AppText>
    </PageTemplate>
  );
}
