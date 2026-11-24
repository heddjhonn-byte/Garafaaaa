import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import StatusBadge from '../../components/atoms/StatusBadge';
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

const roles = [
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Camionero', value: 'Camionero' },
  { label: 'Cliente', value: 'Cliente' },
];

export default function AdminUsuariosScreen() {
  const [editId, setEditId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Camionero');
  const [busy, setBusy] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [notice, setNotice] = useState('');
  const roleOptions = editId ? roles : roles.filter((item) => item.value !== 'Cliente');
  const loader = useCallback(async () => {
    const { data } = await api.get('/usuarios');
    return data.usuarios;
  }, []);
  const resource = useApiResource(loader);

  function startEdit(user) {
    setEditId(user.id);
    setNombre(user.nombre);
    setEmail(user.email);
    setRole(user.rol);
    setPassword('');
    setNotice('');
  }

  function clearForm() {
    setEditId(null);
    setNombre('');
    setEmail('');
    setPassword('');
    setRole('Camionero');
  }

  async function submit() {
    setBusy(true);
    setErrorNotice('');
    setNotice('');
    try {
      if (editId) {
        await api.put(`/usuarios/${editId}`, { nombre: nombre.trim(), email: email.trim().toLowerCase(), rol: role });
        setNotice('Usuario actualizado.');
      } else {
        await api.post('/usuarios', { nombre: nombre.trim(), email: email.trim().toLowerCase(), password, rol: role });
        setNotice('Usuario creado.');
      }
      clearForm();
      await resource.load(true);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(user) {
    setErrorNotice('');
    try {
      await api.patch(`/usuarios/${user.id}/estado`, { activo: !user.activo });
      await resource.load(true);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    }
  }

  function removeUser(user) {
    Alert.alert('Desactivar cuenta', `¿Desactivar a ${user.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desactivar',
        style: 'destructive',
        onPress: async () => {
          setErrorNotice('');
          try {
            await api.delete(`/usuarios/${user.id}`);
            await resource.load(true);
          } catch (requestError) {
            setErrorNotice(getErrorMessage(requestError));
          }
        },
      },
    ]);
  }

  return (
    <PageTemplate title="Usuarios" subtitle="Administración de cuentas y perfiles del sistema" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error || errorNotice} />
      <InlineNotice message={notice} type="success" />
      <SectionHeading title={editId ? `Editar usuario #${editId}` : 'Crear usuario'} subtitle="Los perfiles disponibles son Administrador, Camionero y Cliente." />
      <SurfaceCard>
        <TextField label="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Nombre" autoCapitalize="words" />
        <TextField label="Correo" value={email} onChangeText={setEmail} placeholder="correo@garrafaya.bo" keyboardType="email-address" />
        {!editId ? <TextField label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" secureTextEntry /> : null}
        <ChoiceChips label="Perfil" options={roleOptions} value={role} onChange={setRole} />
        <PrimaryButton title={editId ? 'Guardar cambios' : 'Crear cuenta'} onPress={submit} loading={busy} disabled={!nombre.trim() || !email.trim() || (!editId && password.length < 8)} />
        {editId ? <PrimaryButton title="Cancelar edición" secondary onPress={clearForm} style={{ marginTop: 8 }} /> : null}
      </SurfaceCard>
      <SectionHeading title="Cuentas registradas" />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      {(resource.data || []).map((user) => (
        <SurfaceCard key={user.id}>
          <AppText variant="heading">{user.nombre}</AppText>
          <InfoRow label="Correo" value={user.email} />
          <InfoRow label="Rol" value={user.rol} />
          <StatusBadge label={user.activo ? 'Activo' : 'Inactivo'} tone={user.activo ? 'success' : 'neutral'} />
          <PrimaryButton title="Editar" secondary onPress={() => startEdit(user)} style={{ marginTop: 12 }} />
          <PrimaryButton title={user.activo ? 'Desactivar' : 'Activar'} secondary onPress={() => changeStatus(user)} style={{ marginTop: 8 }} />
          {user.activo ? <PrimaryButton title="Eliminar (desactivar)" onPress={() => removeUser(user)} style={{ backgroundColor: '#B91C1C', marginTop: 8 }} /> : null}
        </SurfaceCard>
      ))}
      {resource.data && resource.data.length === 0 ? <AppText>No hay usuarios registrados.</AppText> : null}
    </PageTemplate>
  );
}
