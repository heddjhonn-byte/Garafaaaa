import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import { colors, spacing } from '../../theme';
import AuthTemplate from '../../components/templates/AuthTemplate';
import FormField from '../../components/molecules/FormField';
import InlineNotice from '../../components/molecules/InlineNotice';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../hooks/useApiResource';

const demoAccounts = [
  { role: 'Administrador', email: 'admin@garrafaya.bo' },
  { role: 'Camionero', email: 'camionero@garrafaya.bo' },
  { role: 'Cliente', email: 'cliente@garrafaya.bo' },
];

export default function LoginScreen({ navigation, route }) {
  const { signIn, restoreError } = useAuth();
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(route.params?.registered ? 'Cuenta creada. Inicia sesión para continuar.' : '');

  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email);
  }, [route.params?.email]);

  async function submit() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await signIn(email, password);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthTemplate title="Iniciar sesión" subtitle="Distribución de GLP para La Paz y El Alto">
      <InlineNotice message={success} type="success" />
      <InlineNotice message={error || restoreError} />
      <FormField label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="tu@correo.com" keyboardType="email-address" />
      <FormField label="Contraseña" value={password} onChangeText={setPassword} placeholder="Tu contraseña" secureTextEntry />
      <PrimaryButton title="Ingresar" onPress={submit} loading={loading} />

      <AppText variant="caption" color={colors.muted} style={styles.quickTitle}>Acceso rápido de prueba</AppText>
      <View style={styles.quickButtons}>
        {demoAccounts.map((account) => (
          <Pressable
            key={account.role}
            style={styles.quickButton}
            onPress={() => {
              setEmail(account.email);
              setPassword('GarrafaYa123!');
              setError('');
            }}
          >
            <AppText variant="caption" color={colors.primary} style={styles.quickLabel}>{account.role}</AppText>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
        <AppText color={colors.primary} style={styles.linkText}>¿No tienes cuenta? Regístrate como Cliente</AppText>
      </Pressable>
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  quickTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  quickButtons: { flexDirection: 'row', gap: 8 },
  quickButton: { alignItems: 'center', backgroundColor: colors.paleBlue, borderRadius: 9, flex: 1, padding: 9 },
  quickLabel: { fontWeight: '700' },
  registerLink: { alignItems: 'center', marginTop: spacing.lg },
  linkText: { fontWeight: '700', textAlign: 'center' },
});
