// (em português) Ecrã inicial: redireciona para mapa público. No futuro pode verificar sessão e role.
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(public)/map" />;
}
