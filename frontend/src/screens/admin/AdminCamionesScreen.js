import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import TextField from '../../components/atoms/TextField';
import ChoiceChips from '../../components/molecules/ChoiceChips';
import InfoRow from '../../components/molecules/InfoRow';
import InlineNotice from '../../components/molecules/InlineNotice';
import SectionHeading from '../../components/molecules/SectionHeading';
import LoadingState from '../../components/organisms/LoadingState';
import TruckMap from '../../components/organisms/TruckMap';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource, { getErrorMessage } from '../../hooks/useApiResource';

export default function AdminCamionesScreen() {
  const [camionId, setCamionId] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [capacidad, setCapacidad] = useState(10);
  const [cantidad, setCantidad] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const loader = useCallback(async () => {
    const [trucksResponse, zonesResponse] = await Promise.all([api.get('/camiones'), api.get('/zonas')]);
    return { trucks: trucksResponse.data.camiones, zones: zonesResponse.data.zonas };
  }, []);
  const resource = useApiResource(loader);

  async function createDispatch() {
    setBusy(true);
    setNotice('');
    setErrorNotice('');
    try {
      await api.post('/despachos', {
        camion_id: Number(camionId),
        zona_id: Number(zonaId),
        capacidad_kg: capacidad,
        cantidad: Number(cantidad),
      });
      setNotice('Salida registrada; el stock y la ruta se actualizaron.');
      setCantidad('');
      await resource.load(true);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTemplate title="Camiones" subtitle="Seguimiento GPS y despachos" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error || errorNotice} />
      <InlineNotice message={notice} type="success" />
      <SectionHeading title="Mapa en vivo" subtitle="Última ubicación GPS o avistamiento reportado" />
      {resource.loading && !resource.data ? <LoadingState /> : <TruckMap trucks={resource.data?.trucks || []} />}
      <SectionHeading title="Nueva salida" subtitle="Al confirmar se descuenta inventario y se asigna la ruta al Camionero del camión." />
      <SurfaceCard>
        <TextField label="ID de camión" value={camionId} onChangeText={setCamionId} placeholder="Ej. 1" keyboardType="number-pad" />
        <TextField label="ID de zona" value={zonaId} onChangeText={setZonaId} placeholder="Ej. 1" keyboardType="number-pad" />
        <ChoiceChips
          label="Capacidad"
          value={capacidad}
          onChange={setCapacidad}
          options={[{ label: '10 kg', value: 10 }, { label: '45 kg', value: 45 }]}
        />
        <TextField label="Cantidad de garrafas" value={cantidad} onChangeText={setCantidad} placeholder="Cantidad" keyboardType="number-pad" />
        <PrimaryButton title="Registrar salida" onPress={createDispatch} loading={busy} disabled={!camionId || !zonaId || !cantidad} />
      </SurfaceCard>
      <SectionHeading title="Flota" subtitle="Stock restante y ubicación informados por el backend" />
      {(resource.data?.trucks || []).map((truck) => (
        <SurfaceCard key={truck.id}>
          <AppText variant="heading">{truck.placa}</AppText>
          <InfoRow label="ID" value={truck.id} />
          <InfoRow label="Camionero" value={truck.camionero_nombre || 'Sin asignar'} />
          <InfoRow label="Stock restante" value={`${truck.stock_restante} garrafas`} />
          <InfoRow label="Ubicación" value={truck.ubicacion || 'Sin ubicación reciente'} />
          <InfoRow label="Coordenadas" value={truck.latitud != null ? `${truck.latitud}, ${truck.longitud}` : '—'} />
        </SurfaceCard>
      ))}
      {!resource.loading && resource.data?.trucks?.length === 0 ? <AppText>No hay camiones registrados.</AppText> : null}
      <View>
        <SectionHeading title="Zonas disponibles" />
        {(resource.data?.zones || []).map((zone) => (
          <AppText key={zone.id} variant="caption">{zone.id} · {zone.nombre} — {zone.ciudad}</AppText>
        ))}
      </View>
    </PageTemplate>
  );
}
