import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AppText from '../atoms/AppText';
import SurfaceCard from '../atoms/SurfaceCard';
import { colors } from '../../theme';

const baseRegion = {
  latitude: -16.5,
  longitude: -68.15,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

function truckCoordinate(truck) {
  const latitude = Number(truck.latitud);
  const longitude = Number(truck.longitud);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

export default function TruckMap({ trucks = [], onSelect }) {
  const visibleTrucks = trucks.filter((truck) => truckCoordinate(truck));
  if (Platform.OS === 'web') {
    return (
      <SurfaceCard style={styles.fallback}>
        <AppText variant="heading">Mapa de La Paz y El Alto</AppText>
        <AppText style={styles.fallbackText}>La vista interactiva del mapa está disponible en la aplicación móvil.</AppText>
        {visibleTrucks.map((truck) => (
          <AppText key={truck.id} variant="caption" style={styles.row}>
            {truck.placa}: {truck.ubicacion || `${truck.latitud}, ${truck.longitud}`}
          </AppText>
        ))}
      </SurfaceCard>
    );
  }

  const firstPosition = visibleTrucks.length ? truckCoordinate(visibleTrucks[0]) : null;
  const initialRegion = firstPosition ? { ...firstPosition, latitudeDelta: 0.06, longitudeDelta: 0.06 } : baseRegion;

  return (
    <View style={styles.mapWrap}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
        {visibleTrucks.map((truck) => (
          <Marker
            key={truck.id}
            coordinate={truckCoordinate(truck)}
            title={truck.placa}
            description={truck.ubicacion || `Stock: ${truck.stock_restante ?? 0}`}
            onCalloutPress={() => onSelect?.(truck)}
          />
        ))}
      </MapView>
      <View style={styles.legend}>
        <AppText variant="caption" color={colors.navy}>
          {visibleTrucks.length ? `${visibleTrucks.length} camión(es) con ubicación` : 'Sin ubicación GPS reciente'}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: { borderRadius: 16, height: 260, overflow: 'hidden' },
  legend: { alignSelf: 'flex-start', backgroundColor: '#FFFFFFE8', borderRadius: 8, bottom: 10, left: 10, padding: 8, position: 'absolute' },
  fallback: { minHeight: 180 },
  fallbackText: { color: colors.muted, marginTop: 8 },
  row: { marginTop: 8 },
});
