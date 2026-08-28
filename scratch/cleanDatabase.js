const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mzkanjhapnqzdltqmitj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y61rQMjnZGTnrV7ucTggSg_bm8ELw5E';
const ADMIN_EMAIL = 'rogervasques@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanDatabase() {
  console.log('Iniciando limpeza do banco de dados...');

  // 1. Limpa logs de mensagens
  try {
    const { error } = await supabase.from('logs_mensagens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Logs de mensagens limpos:', error ? error.message : 'OK');
  } catch (e) {
    console.log('Tabela logs_mensagens erro:', e.message);
  }

  // 2. Limpa visitas
  try {
    const { error } = await supabase.from('visitas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Visitas limpas:', error ? error.message : 'OK');
  } catch (e) {
    console.log('Tabela visitas erro:', e.message);
  }

  // 3. Limpa clientes
  try {
    const { error } = await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Clientes limpos:', error ? error.message : 'OK');
  } catch (e) {
    console.log('Tabela clientes erro:', e.message);
  }

  // 4. Limpa imóveis
  try {
    const { error } = await supabase.from('imoveis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Imóveis limpos:', error ? error.message : 'OK');
  } catch (e) {
    console.log('Tabela imoveis erro:', e.message);
  }

  // 5. Limpa proprietários
  try {
    const { error } = await supabase.from('proprietarios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Proprietários limpos:', error ? error.message : 'OK');
  } catch (e) {
    console.log('Tabela proprietarios erro:', e.message);
  }

  // 6. Limpa convites
  try {
    const { error } = await supabase.from('invites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Convites limpos:', error ? error.message : 'OK');
  } catch (e) {
    console.log('Tabela invites erro:', e.message);
  }

  // 7. Limpa usuários (exceto o Administrador Master)
  try {
    const { data: nonAdminUsers, error: fetchErr } = await supabase
      .from('users')
      .select('id, email, nome')
      .neq('email', ADMIN_EMAIL);

    if (nonAdminUsers && nonAdminUsers.length > 0) {
      console.log(`Removendo ${nonAdminUsers.length} usuários que não são admin...`);
      for (const u of nonAdminUsers) {
        await supabase.from('users').delete().eq('id', u.id);
      }
      console.log('Usuários não-admin removidos com sucesso.');
    } else {
      console.log('Nenhum usuário não-admin encontrado para remoção.');
    }
  } catch (e) {
    console.log('Tabela users erro:', e.message);
  }

  // 8. Verifica contagem final no banco
  console.log('\n--- VERIFICAÇÃO FINAL ---');
  const { count: cImoveis } = await supabase.from('imoveis').select('*', { count: 'exact', head: true });
  const { count: cClientes } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
  const { count: cProprietarios } = await supabase.from('proprietarios').select('*', { count: 'exact', head: true });
  const { count: cVisitas } = await supabase.from('visitas').select('*', { count: 'exact', head: true });
  const { data: remainingUsers } = await supabase.from('users').select('id, nome, email, role');

  console.log('Total Imóveis:', cImoveis || 0);
  console.log('Total Clientes:', cClientes || 0);
  console.log('Total Proprietários:', cProprietarios || 0);
  console.log('Total Visitas:', cVisitas || 0);
  console.log('Usuários restantes:', remainingUsers);

  console.log('\nLimpeza concluída com sucesso!');
}

cleanDatabase();
