import React, { useCallback } from 'react';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import InfoRow from '../../components/molecules/InfoRow';
import InlineNotice from '../../components/molecules/InlineNotice';
import LoadingState from '../../components/organisms/LoadingState';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource from '../../hooks/useApiResource';
import { useAuth } from '../../context/AuthContext';

export default function CamioneroPerfilScreen() {
  const { user, signOut } = useAuth();
  const loader = useCallback(async () => {
    const { data } = await api.get('/camiones');
    return data.camiones.find((truck) => truck.camionero_id === user.id) || null;
  }, [user.id]);
  const resource = useApiResource(loader);

  return (
    <PageTemplate title="Mi perfil" subtitle="Datos de tu cuenta de Camionero" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error} />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      <SurfaceCard>
        <AppText variant="heading">{user.nombre}</AppText>
        <InfoRow label="Perfil" value={user.rol} />
        <InfoRow label="Correo" value={user.email} />
        <InfoRow label="Teléfono" value={user.telefono || '—'} />
        <InfoRow label="CI" value={user.ci || '—'} />
        <InfoRow label="Camión asignado" value={resource.data?.placa || 'Sin asignación'} />
        <InfoRow label="Placa" value={resource.data?.placa || '—'} />
      </SurfaceCard>
      <PrimaryButton title="Cerrar sesión" secondary onPress={signOut} />
    </PageTemplate>
  );
}
