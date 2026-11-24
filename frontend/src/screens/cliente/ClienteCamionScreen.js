import React, { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import InfoRow from '../../components/molecules/InfoRow';
import InlineNotice from '../../components/molecules/InlineNotice';
import SectionHeading from '../../components/molecules/SectionHeading';
import LoadingState from '../../components/organisms/LoadingState';
import TruckMap from '../../components/organisms/TruckMap';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource, { getErrorMessage } from '../../hooks/useApiResource';

export default function ClienteCamionScreen() {
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [notice, setNotice] = useState('');
  const loader = useCallback(async () => {
    const { data } = await api.get('/camiones');
    return data.camiones;
  }, []);
  const resource = useApiResource(loader);
  const chosenTruck = selected || resource.data?.[0] || null;

  async function reportSighting() {
    if (!chosenTruck) return;
    setBusy(true);
    setErrorNotice('');
    setNotice('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Permite el acceso a tu ubicación para reportar un avistamiento.');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await api.post('/avistamientos', {
        camion_id: chosenTruck.id,
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
        ubicacion: 'Avistamiento reportado desde la app',
      });
      setNotice(`Avistamiento de ${chosenTruck.placa} enviado. ¡Gracias por ayudar a tu comunidad!`);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTemplate title="Mi camión" subtitle="Ubicación y stock restante de la flota" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error || errorNotice} />
      <InlineNotice message={notice} type="success" />
      <SectionHeading title="Mapa en tiempo real" subtitle="Ubicaciones GPS y avistamientos recientes" />
      {resource.loading && !resource.data ? <LoadingState /> : <TruckMap trucks={resource.data || []} onSelect={setSelected} />}
      {chosenTruck ? (
        <SurfaceCard>
          <AppText variant="heading">{chosenTruck.placa}</AppText>
          <InfoRow label="Ubicación" value={chosenTruck.ubicacion || 'Sin ubicación reciente'} />
          <InfoRow label="Stock restante" value={`${chosenTruck.stock_restante} garrafas`} />
          <InfoRow label="Capacidad en ruta" value={chosenTruck.capacidad_ruta_kg ? `${chosenTruck.capacidad_ruta_kg} kg` : '—'} />
          <PrimaryButton title="Reportar avistamiento" onPress={reportSighting} loading={busy} style={{ marginTop: 12 }} />
        </SurfaceCard>
      ) : !resource.loading ? (
        <SurfaceCard><AppText>No hay camiones disponibles para mostrar en este momento.</AppText></SurfaceCard>
      ) : null}
    </PageTemplate>
  );
}
