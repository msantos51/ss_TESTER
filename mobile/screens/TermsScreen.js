// Este ficheiro exibe os Termos e Condições completos da aplicação Sunny Sales

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../theme';

export default function TermsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Termos e Condições</Text>

      <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
      <Text style={styles.text}>
        Ao criar uma conta e utilizar a aplicação Sunny Sales, o utilizador (vendedor) concorda com os presentes Termos e Condições. Caso não concorde, não deve utilizar a aplicação.
      </Text>

      <Text style={styles.sectionTitle}>2. Registo e Conta</Text>
      <Text style={styles.text}>
        O vendedor é responsável por fornecer informações verdadeiras, completas e atualizadas no momento do registo. A falsificação de dados poderá resultar no cancelamento da conta.
      </Text>

      <Text style={styles.sectionTitle}>3. Privacidade e Partilha de Localização</Text>
      <Text style={styles.text}>
        A aplicação recolhe e partilha a localização do vendedor apenas durante o período em que este estiver ativo. Esta localização é visível publicamente aos clientes para fins de identificação de vendedores disponíveis.
      </Text>

      <Text style={styles.sectionTitle}>4. Pagamentos e Subscrição</Text>
      <Text style={styles.text}>
        O pagamento da subscrição semanal é obrigatório para manter a conta ativa e visível no mapa. O não pagamento pode suspender temporariamente ou cancelar a conta até que a situação seja regularizada.
      </Text>

      <Text style={styles.sectionTitle}>5. Obrigações do Vendedor</Text>
      <Text style={styles.text}>
        O vendedor compromete-se a:
        {'\n'}• Cumprir a legislação aplicável nas suas atividades comerciais;
        {'\n'}• Garantir a qualidade e segurança dos produtos vendidos;
        {'\n'}• Não utilizar a aplicação para fins ilegais ou fraudulentos.
      </Text>

      <Text style={styles.sectionTitle}>6. Suspensão e Cancelamento</Text>
      <Text style={styles.text}>
        A administração da Sunny Sales reserva-se o direito de suspender ou cancelar a conta de qualquer vendedor que viole estes termos, utilize a aplicação de forma abusiva ou prejudique outros utilizadores.
      </Text>

      <Text style={styles.sectionTitle}>7. Limitação de Responsabilidade</Text>
      <Text style={styles.text}>
        A Sunny Sales não se responsabiliza por quaisquer perdas, danos ou prejuízos resultantes de transações comerciais entre vendedores e clientes. A utilização da aplicação é feita sob responsabilidade do utilizador.
      </Text>

      <Text style={styles.sectionTitle}>8. Alterações aos Termos</Text>
      <Text style={styles.text}>
        Estes Termos e Condições podem ser atualizados periodicamente. Notificaremos os utilizadores através da aplicação em caso de alterações significativas.
      </Text>

      <Text style={styles.sectionTitle}>9. Contacto</Text>
      <Text style={styles.text}>
        Para qualquer dúvida ou questão relacionada com estes termos, o utilizador pode contactar a equipa de suporte através do email: suporte@sunnysales.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  text: {
    marginBottom: 8,
    textAlign: 'justify',
  },
});

