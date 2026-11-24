import React, { useCallback, useState } from 'react';
import AppText from '../../components/atoms/AppText';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import SurfaceCard from '../../components/atoms/SurfaceCard';
import TextField from '../../components/atoms/TextField';
import InlineNotice from '../../components/molecules/InlineNotice';
import SectionHeading from '../../components/molecules/SectionHeading';
import LoadingState from '../../components/organisms/LoadingState';
import PageTemplate from '../../components/templates/PageTemplate';
import api from '../../services/api';
import useApiResource, { getErrorMessage } from '../../hooks/useApiResource';

export default function ClienteNoticiasScreen() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [notice, setNotice] = useState('');
  const loader = useCallback(async () => {
    const { data } = await api.get('/noticias');
    return data.noticias;
  }, []);
  const resource = useApiResource(loader);

  async function publish() {
    setBusy(true);
    setNotice('');
    setErrorNotice('');
    try {
      await api.post('/noticias', { titulo: titulo.trim(), contenido: contenido.trim() });
      setTitulo('');
      setContenido('');
      setNotice('Aviso publicado en el tablero comunitario.');
      await resource.load(true);
    } catch (requestError) {
      setErrorNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTemplate title="Noticias" subtitle="Tablero comunitario sobre el servicio de gas" onRefresh={() => resource.load(true)} refreshing={resource.refreshing}>
      <InlineNotice message={resource.error || errorNotice} />
      <InlineNotice message={notice} type="success" />
      <SectionHeading title="Publicar un aviso" subtitle="Comparte información útil con tu comunidad." />
      <SurfaceCard>
        <TextField label="Título" value={titulo} onChangeText={setTitulo} placeholder="Asunto del aviso" />
        <TextField label="Mensaje" value={contenido} onChangeText={setContenido} placeholder="Escribe el aviso" multiline autoCapitalize="sentences" />
        <PrimaryButton title="Publicar" onPress={publish} loading={busy} disabled={!titulo.trim() || !contenido.trim()} />
      </SurfaceCard>
      <SectionHeading title="Avisos recientes" />
      {resource.loading && !resource.data ? <LoadingState /> : null}
      {(resource.data || []).map((news) => (
        <SurfaceCard key={news.id}>
          <AppText variant="heading">{news.titulo}</AppText>
          <AppText style={{ marginTop: 8 }}>{news.contenido}</AppText>
          <AppText variant="caption" style={{ marginTop: 10 }}>
            {news.autor_nombre} · {new Date(news.created_at).toLocaleString()}
          </AppText>
        </SurfaceCard>
      ))}
      {resource.data && !resource.data.length ? <AppText>Aún no hay avisos publicados.</AppText> : null}
    </PageTemplate>
  );
}
