import React, { useCallback } from 'react';
import { View } from 'react-native';
import AppText from '../../components/atoms/AppText';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import MetricCard from '../../components/molecules/MetricCard';
import SectionHeading from '../../components/molecules/SectionHeading';
import InlineNotice from '../../components/molecules/InlineNotice';
import LoadingState from '../../components/organisms/LoadingState';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource from '../../hooks/useApiResource';
import { colors } from '../../theme';

const officialPrices = [
  { capacidad_kg: 10, precio_bs: '22.50' },
  { capacidad_kg: 45, precio_bs: '101.25' },
];

export default function ClienteInicioScreen() {
  const loader = useCallback(async () => {
    const [pricesResponse, zonesResponse] = await Promise.all([api.get('/precios'), api.get('/zonas')]);
    return { prices: pricesResponse.data.precios, zones: zonesResponse.data.zonas };
  }, []);
  const resource = useApiResource(loader);
  const prices = resource.data?.prices?.length ? resource.data.prices : officialPrices;
  const districts = [...new Set((resource.data?.zones || []).map((zone) => zone.macrodistrito || zone.nombre))];

  return (
    <PageTemplate title="Gas a tu alcance" subtitle="Información oficial para La Paz y El Alto" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error} />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      <SectionHeading title="Precios oficiales" subtitle="Precios de garrafas de GLP" />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {prices.map((price) => (
          <MetricCard
            key={price.capacidad_kg}
            label={`Garrafa ${price.capacidad_kg} kg`}
            value={`${Number(price.precio_bs).toFixed(2)} Bs.`}
            detail="precio oficial"
          />
        ))}
      </View>
      <SectionHeading title="Horarios por zona" subtitle="Los horarios dependen de la ruta y el recorrido del día." />
      <SurfaceCard>
        <AppText>Consulta el mapa de camiones y las noticias de tu zona para ver novedades del servicio.</AppText>
        <AppText variant="caption" color={colors.muted} style={{ marginTop: 8 }}>
          No hay horarios publicados para esta zona todavía.
        </AppText>
      </SurfaceCard>
      {districts.length ? (
        <SurfaceCard>
          <AppText variant="heading">Zonas de servicio</AppText>
          <AppText style={{ marginTop: 6 }}>{districts.join(' · ')}</AppText>
        </SurfaceCard>
      ) : null}
      <SectionHeading title="Alertas" subtitle="Activa las alertas de cercanía desde Mi cuenta." />
      <SurfaceCard>
        <AppText>No tienes alertas nuevas.</AppText>
      </SurfaceCard>
    </PageTemplate>
  );
}
