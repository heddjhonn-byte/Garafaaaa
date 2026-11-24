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

const capacities = [{ label: '10 kg', value: 10 }, { label: '45 kg', value: 45 }];
const movementTypes = [
  { label: 'Entrada planta', value: 'ENTRADA_PLANTA' },
  { label: 'Retorno vacíos', value: 'RETORNO_VACIOS' },
];

export default function AdminGarrafasScreen() {
  const [capacity, setCapacity] = useState(10);
  const [type, setType] = useState('ENTRADA_PLANTA');
  const [quantity, setQuantity] = useState('');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const loader = useCallback(async () => {
    const [inventoryResponse, movementResponse] = await Promise.all([
      api.get('/garrafas/inventario'), api.get('/garrafas/movimientos'),
    ]);
    return { inventory: inventoryResponse.data.inventario, movements: movementResponse.data.movimientos };
  }, []);
  const resource = useApiResource(loader);

  async function submitMovement() {
    setBusy(true);
    setNotice('');
    setErrorNotice('');
    try {
      await api.post('/garrafas/movimientos', {
        capacidad_kg: capacity,
        cantidad: Number(quantity),
        tipo: type,
        detalle: detail.trim() || undefined,
      });
      setNotice(type === 'ENTRADA_PLANTA' ? 'Entrada agregada al stock de planta.' : 'Retorno vacío registrado.');
      setQuantity('');
      setDetail('');
      await resource.load(true);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTemplate title="Inventario de garrafas" subtitle="Control por capacidad y movimientos de planta" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error || errorNotice} />
      <InlineNotice message={notice} type="success" />
      <SectionHeading title="Stock en planta" />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(resource.data?.inventory || []).map((item) => (
          <SurfaceCard key={item.capacidad_kg} style={{ flex: 1 }}>
            <AppText variant="caption">{item.capacidad_kg} kg</AppText>
            <AppText variant="metric" style={{ marginTop: 6 }}>{item.cantidad}</AppText>
            <AppText variant="caption">garrafas llenas</AppText>
          </SurfaceCard>
        ))}
      </View>
      <SectionHeading title="Registrar movimiento" />
      <SurfaceCard>
        <ChoiceChips label="Tipo" options={movementTypes} value={type} onChange={setType} />
        <ChoiceChips label="Capacidad" options={capacities} value={capacity} onChange={setCapacity} />
        <TextField label="Cantidad" value={quantity} onChangeText={setQuantity} placeholder="Cantidad" keyboardType="number-pad" />
        <TextField label="Detalle (opcional)" value={detail} onChangeText={setDetail} placeholder="Nota del movimiento" />
        <PrimaryButton title="Guardar movimiento" onPress={submitMovement} loading={busy} disabled={!quantity} />
        {type === 'RETORNO_VACIOS' ? <AppText variant="caption" style={{ marginTop: 8 }}>Los envases vacíos se registran aparte y no incrementan stock de garrafas llenas.</AppText> : null}
      </SurfaceCard>
      <SectionHeading title="Historial reciente" />
      {(resource.data?.movements || []).slice(0, 40).map((movement) => (
        <SurfaceCard key={movement.id}>
          <AppText variant="heading">{movement.tipo.replaceAll('_', ' ')}</AppText>
          <InfoRow label="Cantidad" value={`${movement.cantidad} × ${movement.capacidad_kg} kg`} />
          <InfoRow label="Registrado por" value={movement.usuario_nombre} />
          <InfoRow label="Detalle" value={movement.detalle || '—'} />
          <InfoRow label="Fecha" value={new Date(movement.created_at).toLocaleString()} />
        </SurfaceCard>
      ))}
    </PageTemplate>
  );
}
