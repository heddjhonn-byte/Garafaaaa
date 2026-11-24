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
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource, { getErrorMessage } from '../../hooks/useApiResource';

const capacityOptions = [{ label: '10 kg', value: 10 }, { label: '45 kg', value: 45 }];

export default function AdminRutasScreen() {
  const [camionId, setCamionId] = useState('');
  const [camioneroId, setCamioneroId] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [busy, setBusy] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [notice, setNotice] = useState('');
  const loader = useCallback(async () => {
    const [routesResponse, incidentsResponse, zonesResponse, trucksResponse] = await Promise.all([
      api.get('/rutas'), api.get('/incidentes'), api.get('/zonas'), api.get('/camiones'),
    ]);
    return {
      routes: routesResponse.data.rutas,
      incidents: incidentsResponse.data.incidentes,
      zones: zonesResponse.data.zonas,
      trucks: trucksResponse.data.camiones,
    };
  }, []);
  const resource = useApiResource(loader);

  async function createRoute() {
    setBusy(true);
    setErrorNotice('');
    setNotice('');
    try {
      await api.post('/rutas', {
        camion_id: Number(camionId),
        camionero_id: Number(camioneroId),
        zona_id: Number(zonaId),
        capacidad_kg: capacity,
      });
      setNotice('Ruta pendiente creada.');
      await resource.load(true);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function resolveIncident(id) {
    setErrorNotice('');
    try {
      await api.patch(`/incidentes/${id}/resolver`);
      await resource.load(true);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    }
  }

  return (
    <PageTemplate title="Rutas e incidentes" subtitle="Asignación por zonas y control de novedades viales" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error || errorNotice} />
      <InlineNotice message={notice} type="success" />
      <SectionHeading title="Asignar ruta" subtitle="El camión debe estar asignado al Camionero elegido." />
      <SurfaceCard>
        <TextField label="ID de camión" value={camionId} onChangeText={setCamionId} keyboardType="number-pad" placeholder="ID" />
        <TextField label="ID de Camionero" value={camioneroId} onChangeText={setCamioneroId} keyboardType="number-pad" placeholder="ID" />
        <TextField label="ID de zona" value={zonaId} onChangeText={setZonaId} keyboardType="number-pad" placeholder="ID" />
        <ChoiceChips label="Capacidad" options={capacityOptions} value={capacity} onChange={setCapacity} />
        <PrimaryButton title="Crear ruta pendiente" onPress={createRoute} loading={busy} disabled={!camionId || !camioneroId || !zonaId} />
      </SurfaceCard>
      <SectionHeading title="Rutas registradas" />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      {(resource.data?.routes || []).map((route) => (
        <SurfaceCard key={route.id}>
          <AppText variant="heading">Ruta #{route.id} · {route.placa}</AppText>
          <InfoRow label="Zona" value={`${route.zona_nombre}, ${route.ciudad}`} />
          <InfoRow label="Camionero" value={route.camionero_nombre} />
          <InfoRow label="Estado" value={route.estado} />
          <InfoRow label="Progreso" value={`${route.garrafas_entregadas}/${route.garrafas_iniciales}`} />
        </SurfaceCard>
      ))}
      <SectionHeading title="Incidentes viales" subtitle="Resolución administrativa de reportes de ruta" />
      {(resource.data?.incidents || []).map((incident) => (
        <SurfaceCard key={incident.id}>
          <AppText variant="heading">Incidente #{incident.id} · {incident.placa}</AppText>
          <AppText style={{ marginTop: 6 }}>{incident.descripcion}</AppText>
          <InfoRow label="Reportado por" value={incident.reportado_por_nombre} />
          <InfoRow label="Estado" value={incident.resuelto_en ? 'Resuelto' : 'Pendiente'} />
          {!incident.resuelto_en ? <PrimaryButton title="Marcar resuelto" secondary onPress={() => resolveIncident(incident.id)} /> : null}
        </SurfaceCard>
      ))}
      {resource.data && !resource.data.incidents.length ? <AppText>No hay incidentes reportados.</AppText> : null}
      <View>
        <SectionHeading title="Zonas activas" />
        {(resource.data?.zones || []).filter((zone) => zone.activa).map((zone) => (
          <AppText key={zone.id} variant="caption">{zone.id} · {zone.macrodistrito || zone.nombre}: {zone.nombre} ({zone.ciudad})</AppText>
        ))}
      </View>
      <View>
        <SectionHeading title="Camiones disponibles" />
        {(resource.data?.trucks || []).map((truck) => (
          <AppText key={truck.id} variant="caption">{truck.id} · {truck.placa} · Camionero ID {truck.camionero_id || 'sin asignar'}</AppText>
        ))}
      </View>
    </PageTemplate>
  );
}
