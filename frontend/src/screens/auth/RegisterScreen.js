import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import AuthTemplate from '../../components/templates/AuthTemplate';
import FormField from '../../components/molecules/FormField';
import InlineNotice from '../../components/molecules/InlineNotice';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../hooks/useApiResource';
import { colors, spacing } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [ci, setCi] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const cleanPhone = telefono.trim().replace(/^\+?591\s*/, '');
      await register({
        nombre: nombre.trim(),
        ci: ci.trim() ? `${ci.trim()} LP` : '',
        telefono: cleanPhone ? `+591${cleanPhone}` : '',
        email: email.trim().toLowerCase(),
        password,
      });
      navigation.replace('Login', { registered: true, email: email.trim().toLowerCase() });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthTemplate title="Crear cuenta Cliente" subtitle="Regístrate para recibir novedades y reportar avistamientos">
      <InlineNotice message={error} />
      <FormField label="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Nombre y apellido" autoCapitalize="words" />
      <FormField label="Carnet de identidad (extensión LP)" value={ci} onChangeText={setCi} placeholder="Ej. 1234567" keyboardType="number-pad" />
      <FormField label="Teléfono (+591)" value={telefono} onChangeText={setTelefono} placeholder="70000000" keyboardType="phone-pad" />
      <FormField label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="tu@correo.com" keyboardType="email-address" />
      <FormField label="Contraseña (mínimo 8 caracteres)" value={password} onChangeText={setPassword} placeholder="Crea una contraseña" secureTextEntry />
      <PrimaryButton title="Crear cuenta" onPress={submit} loading={loading} />
      <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
        <AppText color={colors.primary} style={styles.link}>Ya tengo cuenta · Iniciar sesión</AppText>
      </Pressable>
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  backLink: { alignItems: 'center', marginTop: spacing.md },
  link: { fontWeight: '700' },
});
