import React, { useCallback } from 'react';
import AppText from '../../components/atoms/AppText';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import InfoRow from '../../components/molecules/InfoRow';
import SectionHeading from '../../components/molecules/SectionHeading';
import InlineNotice from '../../components/molecules/InlineNotice';
import EmptyState from '../../components/molecules/EmptyState';
import LoadingState from '../../components/organisms/LoadingState';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource from '../../hooks/useApiResource';
import { useAuth } from '../../context/AuthContext';

export default function ClienteHistorialScreen() {
  const { user } = useAuth();
  const loader = useCallback(async () => {
    const { data } = await api.get('/avistamientos');
    return data.avistamientos.filter((item) => String(item.cliente_id) === String(user.id));
  }, [user.id]);
  const resource = useApiResource(loader);

  return (
    <PageTemplate title="Mi historial" subtitle="Tus reportes vecinales y alertas" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error} />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      <SectionHeading title="Mis avistamientos" />
      {(resource.data || []).map((sighting) => (
        <SurfaceCard key={sighting.id}>
          <AppText variant="heading">Camión {sighting.placa}</AppText>
          <InfoRow label="Ubicación" value={sighting.ubicacion || `${sighting.latitud}, ${sighting.longitud}`} />
          <InfoRow label="Comentario" value={sighting.comentario || '—'} />
          <InfoRow label="Fecha" value={new Date(sighting.created_at).toLocaleString()} />
        </SurfaceCard>
      ))}
      {resource.data && !resource.data.length ? <EmptyState title="Aún no tienes reportes" description="Tus avistamientos de camiones aparecerán aquí." /> : null}
      <SectionHeading title="Alertas recibidas" />
      <SurfaceCard>
        <AppText>No tienes alertas nuevas.</AppText>
        <AppText variant="caption" style={{ marginTop: 6 }}>Las alertas de cercanía aparecerán aquí cuando estén disponibles para tu zona.</AppText>
      </SurfaceCard>
    </PageTemplate>
  );
}
