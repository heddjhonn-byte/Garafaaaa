import React, { useCallback, useState } from 'react';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import TextField from '../../components/atoms/TextField';
import ChoiceChips from '../../components/molecules/ChoiceChips';
import InlineNotice from '../../components/molecules/InlineNotice';
import SectionHeading from '../../components/molecules/SectionHeading';
import LoadingState from '../../components/organisms/LoadingState';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource, { getErrorMessage } from '../../hooks/useApiResource';

const incidentTypes = [
  { label: 'Tráfico', value: 'Tráfico' },
  { label: 'Bloqueo', value: 'Bloqueo' },
  { label: 'Falla mecánica', value: 'Falla mecánica' },
  { label: 'Otro', value: 'Otro' },
];

export default function CamioneroIncidentesScreen() {
  const [type, setType] = useState('Tráfico');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [notice, setNotice] = useState('');
  const loader = useCallback(async () => {
    const [{ data: routeData }, { data: incidentData }] = await Promise.all([
      api.get('/rutas/mi-ruta'), api.get('/incidentes'),
    ]);
    return { route: routeData.ruta, incidents: incidentData.incidentes };
  }, []);
  const resource = useApiResource(loader);

  async function submit() {
    if (!resource.data?.route) return;
    setBusy(true);
    setErrorNotice('');
    setNotice('');
    try {
      await api.post('/incidentes', {
        ruta_id: resource.data.route.id,
        descripcion: `${type}: ${description.trim()}`,
      });
      setDescription('');
      setNotice('Incidente enviado a Administración.');
      await resource.load(true);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTemplate title="Incidentes de ruta" subtitle="Reporta tráfico, bloqueos o fallas mecánicas" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error || errorNotice} />
      <InlineNotice message={notice} type="success" />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      {resource.data?.route ? (
        <SurfaceCard>
          <AppText variant="heading">Ruta #{resource.data.route.id} · {resource.data.route.placa}</AppText>
          <AppText variant="caption">{resource.data.route.zona_nombre}, {resource.data.route.ciudad}</AppText>
          <SectionHeading title="Nuevo reporte" />
          <ChoiceChips options={incidentTypes} value={type} onChange={setType} label="Tipo de incidente" />
          <TextField label="Descripción" value={description} onChangeText={setDescription} placeholder="Describe brevemente lo ocurrido" multiline autoCapitalize="sentences" />
          <PrimaryButton title="Enviar incidente" onPress={submit} loading={busy} disabled={!description.trim()} />
        </SurfaceCard>
      ) : resource.data ? (
        <SurfaceCard><AppText>No puedes reportar un incidente sin una ruta activa.</AppText></SurfaceCard>
      ) : null}
      <SectionHeading title="Reportes de tus rutas" />
      {(resource.data?.incidents || []).map((incident) => (
        <SurfaceCard key={incident.id}>
          <AppText variant="heading">{incident.descripcion}</AppText>
          <AppText variant="caption" style={{ marginTop: 6 }}>
            {incident.resuelto_en ? 'Resuelto por Administración' : 'Pendiente de revisión'}
          </AppText>
        </SurfaceCard>
      ))}
    </PageTemplate>
  );
}
