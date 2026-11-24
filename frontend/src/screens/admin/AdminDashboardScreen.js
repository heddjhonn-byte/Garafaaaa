import React, { useCallback } from 'react';
import { View } from 'react-native';
import AppText from '../../components/atoms/AppText';
import MetricCard from '../../components/molecules/MetricCard';
import SectionHeading from '../../components/molecules/SectionHeading';
import InlineNotice from '../../components/molecules/InlineNotice';
import LoadingState from '../../components/organisms/LoadingState';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource from '../../hooks/useApiResource';
import { colors } from '../../theme';

export default function AdminDashboardScreen() {
  const loader = useCallback(async () => {
    const { data } = await api.get('/dashboard/resumen');
    return data.resumen;
  }, []);
  const { data, loading, refreshing, error, load } = useApiResource(loader);

  return (
    <PageTemplate title="Panel operativo" subtitle="Resumen de distribución de hoy" onRefresh={() => load(true)} refreshing={refreshing}>
      <InlineNotice message={error} />
      {loading && !data ? <LoadingState /> : null}
      {data ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <MetricCard label="Stock planta · 10 kg" value={data.stock_planta_10kg} detail="garrafas" />
          <MetricCard label="Stock planta · 45 kg" value={data.stock_planta_45kg} detail="garrafas" />
          <MetricCard label="Salidas hoy" value={data.salidas_hoy} detail="despachos" />
          <MetricCard label="Retornos hoy" value={data.retornos_hoy} detail="garrafas vacías" />
          <MetricCard label="Camiones activos" value={data.camiones_activos} />
          <MetricCard label="Entregas hoy" value={data.entregas_hoy} detail="garrafas" />
        </View>
      ) : null}
      <SectionHeading title="Operación segura" subtitle="Los despachos registran inventario, movimiento y ruta en una transacción." />
      <AppText color={colors.muted}>Actualiza los datos deslizando hacia abajo.</AppText>
    </PageTemplate>
  );
}
