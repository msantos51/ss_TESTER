import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Termos e Condições</Text>

        <Section title="1. Introdução">
          <Text style={styles.text}>
            Bem-vindo ao Sunny Sales. Estes Termos e Condições regulam o uso da nossa plataforma de localização em tempo real para vendedores de produtos de praia.
          </Text>
        </Section>

        <Section title="2. Acesso à Plataforma">
          <Text style={styles.text}>
            Ao utilizar o Sunny Sales, concorda com todos os termos e condições aqui descritos. Se não concordar, não deve usar a plataforma.
          </Text>
        </Section>

        <Section title="3. Localização em Tempo Real">
          <Text style={styles.text}>
            - Os vendedores consentem em partilhar a sua localização quando tem uma subscrição ativa.
          </Text>
          <Text style={styles.text}>
            - A localização é transmitida em tempo real para clientes da plataforma.
          </Text>
          <Text style={styles.text}>
            - Pode parar de partilhar localização a qualquer momento.
          </Text>
        </Section>

        <Section title="4. Privacidade de Dados">
          <Text style={styles.text}>
            Os seus dados pessoais são processados de acordo com o RGPD e a nossa Política de Privacidade.
          </Text>
        </Section>

        <Section title="5. Subscrição">
          <Text style={styles.text}>
            - A subscrição é necessária para partilhar localização.
          </Text>
          <Text style={styles.text}>
            - Os pagamentos são processados de forma segura.
          </Text>
          <Text style={styles.text}>
            - Pode cancelar a subscrição a qualquer momento.
          </Text>
        </Section>

        <Section title="6. Responsabilidades">
          <Text style={styles.text}>
            Os vendedores são responsáveis por:
          </Text>
          <Text style={styles.text}>
            - Manter informações de conta precisas
          </Text>
          <Text style={styles.text}>
            - Cumprir todas as leis aplicáveis
          </Text>
          <Text style={styles.text}>
            - Não prejudicar outros utilizadores
          </Text>
        </Section>

        <Section title="7. Isenção de Responsabilidade">
          <Text style={styles.text}>
            O Sunny Sales fornece a plataforma "como está". Não garantimos precisão contínua da localização ou disponibilidade do serviço.
          </Text>
        </Section>

        <Section title="8. Limitação de Responsabilidade">
          <Text style={styles.text}>
            O Sunny Sales não será responsável por perdas ou danos indiretos resultantes do uso da plataforma.
          </Text>
        </Section>

        <Section title="9. Modificações dos Termos">
          <Text style={styles.text}>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos os utilizadores de mudanças significativas.
          </Text>
        </Section>

        <Section title="10. Lei Aplicável">
          <Text style={styles.text}>
            Estes Termos são regidos pelas leis de Portugal.
          </Text>
        </Section>

        <Text style={styles.lastUpdated}>
          Última atualização: Junho de 2024
        </Text>
      </View>
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginTop: 24,
    marginBottom: 32,
  },
});
