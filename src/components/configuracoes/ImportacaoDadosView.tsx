'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Building2,
  UserCheck,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  Check,
  X,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  downloadModeloClientesXLSX,
  downloadModeloProprietariosXLSX,
  downloadModeloImoveisXLSX,
  parseExcelOrCsvFile,
} from '@/lib/excelHelpers';
import { useData } from '@/context/DataContext';
import { useTenant } from '@/context/TenantContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, formatPhone } from '@/lib/utils';
import { Cliente, Proprietario, Imovel, TipoImovel, FinalidadeImovel } from '@/types';

type SecaoAtiva = 'clientes' | 'proprietarios' | 'imoveis';
type AbaImovel = 'excel' | 'xml';

export function ImportacaoDadosView() {
  const {
    clientes,
    proprietarios,
    imoveis,
    adicionarCliente,
    adicionarProprietario,
    adicionarImovel,
    showToast,
  } = useData();
  const { currentTenant } = useTenant();

  const [secaoAtiva, setSecaoAtiva] = useState<SecaoAtiva>('clientes');
  const [abaImovel, setAbaImovel] = useState<AbaImovel>('xml');

  // Estados da Seção A (Clientes)
  const [fileClientes, setFileClientes] = useState<File | null>(null);
  const [parsedClientes, setParsedClientes] = useState<Record<string, any>[]>([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [resultadoClientes, setResultadoClientes] = useState<{ novos: number; ignorados: number } | null>(null);

  // Estados da Seção B (Proprietários)
  const [fileProprietarios, setFileProprietarios] = useState<File | null>(null);
  const [parsedProprietarios, setParsedProprietarios] = useState<Record<string, any>[]>([]);
  const [isLoadingProprietarios, setIsLoadingProprietarios] = useState(false);
  const [resultadoProprietarios, setResultadoProprietarios] = useState<{ novos: number; ignorados: number } | null>(null);

  // Estados da Seção C (Imóveis - Excel)
  const [fileImoveis, setFileImoveis] = useState<File | null>(null);
  const [parsedImoveis, setParsedImoveis] = useState<Record<string, any>[]>([]);
  const [isLoadingImoveisExcel, setIsLoadingImoveisExcel] = useState(false);
  const [resultadoImoveisExcel, setResultadoImoveisExcel] = useState<{ novos: number; ignorados: number } | null>(null);

  // Estados da Seção C (Imóveis - Feed XML Kenlo)
  const [xmlUrl, setXmlUrl] = useState('');
  const [atualizarExistentesXML, setAtualizarExistentesXML] = useState(false);
  const [isLoadingXML, setIsLoadingXML] = useState(false);
  const [resultadoXML, setResultadoXML] = useState<{
    totalEncontrados: number;
    novosCadastrados: number;
    jaExistentesIgnorados: number;
    atualizados: number;
    erros: number;
    resumo: { codigo: string; titulo: string; status: string }[];
  } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS SEÇÃO A: CLIENTES
  // ─────────────────────────────────────────────────────────────
  const handleFileChangeClientes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileClientes(file);
    setResultadoClientes(null);
    try {
      const rows = await parseExcelOrCsvFile(file);
      setParsedClientes(rows);
      if (rows.length === 0) {
        showToast('Nenhum dado encontrado na planilha enviada.', 'info');
      } else {
        showToast(`${rows.length} registros identificados na planilha de clientes!`, 'success');
      }
    } catch {
      showToast('Erro ao ler a planilha. Verifique o formato do arquivo.', 'error');
    }
  };

  const handleImportarClientes = async () => {
    if (parsedClientes.length === 0) return;
    setIsLoadingClientes(true);
    let novos = 0;
    let ignorados = 0;

    const existingPhones = new Set(clientes.map((c) => c.telefone.replace(/\D/g, '')));

    for (const row of parsedClientes) {
      const nome = String(row['Nome'] || row['nome'] || row['Cliente'] || row['CLIENTE'] || '').trim();
      const telefone = String(row['Telefone'] || row['telefone'] || row['Celular'] || row['WhatsApp'] || '').trim();
      const email = String(row['E-mail'] || row['Email'] || row['email'] || '').trim();
      const perfil = String(row['Perfil de Interesse'] || row['Interesse'] || row['perfil_interesse'] || '').trim();
      const orcamento = String(row['Faixa de Orçamento'] || row['Orçamento'] || row['Orcamento'] || '').trim();
      const obs = String(row['Observações'] || row['Observacoes'] || row['obs'] || '').trim();

      if (!nome || !telefone) {
        ignorados++;
        continue;
      }

      const cleanPhone = telefone.replace(/\D/g, '');
      if (cleanPhone && existingPhones.has(cleanPhone)) {
        ignorados++;
        continue;
      }

      try {
        await adicionarCliente({
          nome,
          telefone,
          email: email || undefined,
          perfil_interesse: perfil || undefined,
          faixa_orcamento: orcamento || undefined,
          observacoes: obs || undefined,
          status: 'ativo',
          origem_lead: 'site',
          etapa_crm: 'novos_leads',
        });
        if (cleanPhone) existingPhones.add(cleanPhone);
        novos++;
      } catch {
        ignorados++;
      }
    }

    setIsLoadingClientes(false);
    setResultadoClientes({ novos, ignorados });
    setParsedClientes([]);
    setFileClientes(null);
    showToast(`Importação concluída: ${novos} novos clientes cadastrados!`, 'success');
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS SEÇÃO B: PROPRIETÁRIOS
  // ─────────────────────────────────────────────────────────────
  const handleFileChangeProprietarios = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileProprietarios(file);
    setResultadoProprietarios(null);
    try {
      const rows = await parseExcelOrCsvFile(file);
      setParsedProprietarios(rows);
      if (rows.length === 0) {
        showToast('Nenhum dado encontrado na planilha de proprietários.', 'info');
      } else {
        showToast(`${rows.length} proprietários identificados na planilha!`, 'success');
      }
    } catch {
      showToast('Erro ao ler a planilha. Verifique o formato do arquivo.', 'error');
    }
  };

  const handleImportarProprietarios = async () => {
    if (parsedProprietarios.length === 0) return;
    setIsLoadingProprietarios(true);
    let novos = 0;
    let ignorados = 0;

    const existingPhones = new Set(proprietarios.map((p) => p.telefone.replace(/\D/g, '')));

    for (const row of parsedProprietarios) {
      const nome = String(row['Nome'] || row['nome'] || row['Proprietário'] || '').trim();
      const telefone = String(row['Telefone'] || row['telefone'] || row['Celular'] || '').trim();
      const email = String(row['E-mail'] || row['Email'] || row['email'] || '').trim();
      const documento = String(row['Documento'] || row['CPF'] || row['CNPJ'] || '').trim();
      const chavePix = String(row['Chave PIX'] || row['PIX'] || row['chave_pix'] || '').trim();
      const banco = String(row['Banco'] || row['Dados Bancários'] || '').trim();
      const obs = String(row['Observações'] || row['Observacoes'] || '').trim();

      if (!nome || !telefone) {
        ignorados++;
        continue;
      }

      const cleanPhone = telefone.replace(/\D/g, '');
      if (cleanPhone && existingPhones.has(cleanPhone)) {
        ignorados++;
        continue;
      }

      try {
        await adicionarProprietario({
          nome,
          telefone,
          email: email || undefined,
          documento: documento || undefined,
          chave_pix: chavePix || undefined,
          banco_nome: banco || undefined,
          observacoes: obs || undefined,
        });
        if (cleanPhone) existingPhones.add(cleanPhone);
        novos++;
      } catch {
        ignorados++;
      }
    }

    setIsLoadingProprietarios(false);
    setResultadoProprietarios({ novos, ignorados });
    setParsedProprietarios([]);
    setFileProprietarios(null);
    showToast(`Importação concluída: ${novos} proprietários cadastrados!`, 'success');
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS SEÇÃO C: IMÓVEIS (EXCEL)
  // ─────────────────────────────────────────────────────────────
  const handleFileChangeImoveisExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileImoveis(file);
    setResultadoImoveisExcel(null);
    try {
      const rows = await parseExcelOrCsvFile(file);
      setParsedImoveis(rows);
      if (rows.length === 0) {
        showToast('Nenhum imóvel encontrado na planilha enviada.', 'info');
      } else {
        showToast(`${rows.length} imóveis identificados na planilha!`, 'success');
      }
    } catch {
      showToast('Erro ao ler a planilha de imóveis.', 'error');
    }
  };

  const handleImportarImoveisExcel = async () => {
    if (parsedImoveis.length === 0) return;
    setIsLoadingImoveisExcel(true);
    let novos = 0;
    let ignorados = 0;

    const existingCodigos = new Set(imoveis.map((im) => String(im.codigo).trim().toUpperCase()));

    for (const row of parsedImoveis) {
      const codigo = String(row['Código'] || row['Codigo'] || row['Referencia'] || `IMO-${Date.now().toString().slice(-4)}`).trim();
      const titulo = String(row['Título'] || row['Titulo'] || row['Nome'] || '').trim();
      const tipoRaw = String(row['Tipo'] || 'apartamento').toLowerCase();
      const finalidadeRaw = String(row['Finalidade'] || 'venda').toLowerCase();
      const endereco = String(row['Endereço'] || row['Endereco'] || 'Endereço não informado').trim();
      const bairro = String(row['Bairro'] || 'Centro').trim();
      const cidade = String(row['Cidade'] || 'São Paulo').trim();
      const estado = String(row['Estado'] || row['UF'] || 'SP').trim().toUpperCase();

      if (!titulo) {
        ignorados++;
        continue;
      }

      const codigoKey = codigo.toUpperCase();
      if (existingCodigos.has(codigoKey)) {
        ignorados++;
        continue;
      }

      const fotosStr = String(row['URLs das Fotos'] || row['Fotos'] || row['Fotos URLs'] || row['Foto'] || '');
      const fotosList = fotosStr
        .split(/[,;\n]/)
        .map((u) => u.trim())
        .filter((u) => u.startsWith('http'));

      try {
        await adicionarImovel({
          codigo,
          titulo,
          tipo: (['apartamento', 'casa', 'cobertura', 'terreno', 'comercial'].includes(tipoRaw) ? tipoRaw : 'apartamento') as TipoImovel,
          finalidade: (['venda', 'locacao', 'ambos'].includes(finalidadeRaw) ? finalidadeRaw : 'venda') as FinalidadeImovel,
          endereco,
          numero: String(row['Número'] || row['Numero'] || '').trim() || undefined,
          complemento: String(row['Complemento'] || '').trim() || undefined,
          bairro,
          cidade,
          estado,
          cep: String(row['CEP'] || row['Cep'] || '').trim() || undefined,
          valor_venda: Number(row['Valor Venda'] || row['ValorVenda'] || 0) || null,
          valor_locacao: Number(row['Valor Locação'] || row['ValorLocacao'] || 0) || null,
          valor_condominio: Number(row['Valor Condomínio'] || row['Condominio'] || 0) || null,
          valor_iptu: Number(row['Valor IPTU'] || row['IPTU'] || 0) || null,
          quartos: Number(row['Quartos'] || row['Dormitórios'] || 1),
          suites: Number(row['Suítes'] || row['Suites'] || 0),
          banheiros: Number(row['Banheiros'] || 1),
          vagas: Number(row['Vagas'] || row['Garagem'] || 0),
          area_util: Number(row['Área Útil'] || row['AreaUtil'] || 0) || null,
          area_construida: Number(row['Área Total'] || row['AreaTotal'] || 0) || null,
          descricao_comercial: String(row['Descrição'] || row['Descricao'] || '').trim() || null,
          imagem_url: fotosList[0] || undefined,
          fotos_urls: fotosList.length > 0 ? fotosList : undefined,
          proprietario_nome: String(row['Nome do Proprietário'] || row['Proprietario'] || 'Não informado').trim(),
          proprietario_telefone: String(row['Telefone do Proprietário'] || '').trim(),
          observacoes_chaves: String(row['Observações Chaves'] || row['Chaves'] || '').trim() || undefined,
          status: 'disponivel',
        });
        existingCodigos.add(codigoKey);
        novos++;
      } catch {
        ignorados++;
      }
    }

    setIsLoadingImoveisExcel(false);
    setResultadoImoveisExcel({ novos, ignorados });
    setParsedImoveis([]);
    setFileImoveis(null);
    showToast(`Importação de imóveis concluída: ${novos} cadastrados!`, 'success');
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS SEÇÃO C: FEED XML (KENLO / PORTAIS)
  // ─────────────────────────────────────────────────────────────
  const handleImportarFeedXML = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!xmlUrl.trim()) {
      showToast('Cole a URL do Feed XML para iniciar a importação.', 'info');
      return;
    }

    setIsLoadingXML(true);
    setResultadoXML(null);

    try {
      const response = await fetch('/api/importacao/xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: xmlUrl.trim(),
          imobiliaria_id: currentTenant?.id,
          imobiliaria_nome: currentTenant?.nome,
          atualizarExistentes: atualizarExistentesXML,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResultadoXML({
          totalEncontrados: data.totalEncontrados,
          novosCadastrados: data.novosCadastrados,
          jaExistentesIgnorados: data.jaExistentesIgnorados,
          atualizados: data.atualizados,
          erros: data.erros,
          resumo: data.resumo || [],
        });

        // Se houve novos cadastrados, adiciona dinamicamente ao contexto
        if (Array.isArray(data.novosImoveis) && data.novosImoveis.length > 0) {
          for (const item of data.novosImoveis) {
            try {
              await adicionarImovel(item);
            } catch {
              // Já inserido no Supabase pela API route
            }
          }
        }

        showToast(
          `Importação XML concluída! ${data.novosCadastrados} novos cadastrados, ${data.jaExistentesIgnorados} ignorados.`,
          'success'
        );
      } else {
        showToast(data.error || 'Falha ao processar o Feed XML.', 'error');
      }
    } catch (err: any) {
      showToast(`Erro na requisição: ${err.message || 'Falha de rede'}`, 'error');
    } finally {
      setIsLoadingXML(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── SELETOR PRINCIPAL DE ABAS DE IMPORTAÇÃO ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setSecaoAtiva('clientes')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            secaoAtiva === 'clientes'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>A. Clientes (Excel)</span>
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('proprietarios')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            secaoAtiva === 'proprietarios'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/40'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>B. Proprietários (Excel)</span>
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('imoveis')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            secaoAtiva === 'imoveis'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>C. Imóveis (Excel / XML Kenlo)</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO A: IMPORTAÇÃO DE CLIENTES                              */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {secaoAtiva === 'clientes' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Importação de Clientes (Excel / CSV)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cadastre seus contatos e leads em massa a partir de planilhas .xlsx ou .csv.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadModeloClientesXLSX}
              className="shrink-0 font-bold text-xs border-emerald-600/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Planilha Modelo (.xlsx)</span>
            </Button>
          </div>

          {/* Campo de Upload */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Selecione o arquivo da planilha:
            </label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/30">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChangeClientes}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {fileClientes ? fileClientes.name : 'Arraste ou clique para selecionar sua planilha'}
                </p>
                <p className="text-xs text-slate-500">Formatos suportados: .xlsx, .xls ou .csv</p>
              </div>
            </div>

            {/* Preview e Botão de Ação */}
            {parsedClientes.length > 0 && (
              <div className="space-y-4 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <strong>{parsedClientes.length}</strong> clientes prontos para importação.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedClientes([]);
                      setFileClientes(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Limpar
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">Nome</th>
                        <th className="p-2.5">Telefone</th>
                        <th className="p-2.5">E-mail</th>
                        <th className="p-2.5">Perfil de Interesse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                      {parsedClientes.slice(0, 10).map((r, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">{r['Nome'] || r['nome'] || '—'}</td>
                          <td className="p-2.5">{r['Telefone'] || r['telefone'] || '—'}</td>
                          <td className="p-2.5">{r['E-mail'] || r['email'] || '—'}</td>
                          <td className="p-2.5 truncate max-w-xs">{r['Perfil de Interesse'] || r['Interesse'] || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleImportarClientes}
                    isLoading={isLoadingClientes}
                    disabled={isLoadingClientes}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Importar {parsedClientes.length} Clientes</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Resultado Final */}
            {resultadoClientes && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs animate-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                      Importação de Clientes Concluída com Sucesso!
                    </h4>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                      • <strong>{resultadoClientes.novos}</strong> novos clientes cadastrados.
                      {resultadoClientes.ignorados > 0 && ` • ${resultadoClientes.ignorados} ignorados (telefones já existentes ou inválidos).`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO B: IMPORTAÇÃO DE PROPRIETÁRIOS                          */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {secaoAtiva === 'proprietarios' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-500" />
                Importação de Proprietários (Excel / CSV)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Importe sua carteira de proprietários com dados de contato, documento e chaves PIX.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadModeloProprietariosXLSX}
              className="shrink-0 font-bold text-xs border-emerald-600/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Planilha Modelo (.xlsx)</span>
            </Button>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Selecione o arquivo da planilha:
            </label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/30">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChangeProprietarios}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {fileProprietarios ? fileProprietarios.name : 'Arraste ou clique para selecionar sua planilha'}
                </p>
                <p className="text-xs text-slate-500">Formatos suportados: .xlsx, .xls ou .csv</p>
              </div>
            </div>

            {parsedProprietarios.length > 0 && (
              <div className="space-y-4 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <strong>{parsedProprietarios.length}</strong> proprietários prontos para importação.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedProprietarios([]);
                      setFileProprietarios(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Limpar
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">Nome</th>
                        <th className="p-2.5">Telefone</th>
                        <th className="p-2.5">Documento</th>
                        <th className="p-2.5">Chave PIX</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                      {parsedProprietarios.slice(0, 10).map((r, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">{r['Nome'] || r['nome'] || '—'}</td>
                          <td className="p-2.5">{r['Telefone'] || r['telefone'] || '—'}</td>
                          <td className="p-2.5">{r['Documento'] || r['CPF'] || '—'}</td>
                          <td className="p-2.5">{r['Chave PIX'] || r['PIX'] || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleImportarProprietarios}
                    isLoading={isLoadingProprietarios}
                    disabled={isLoadingProprietarios}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Importar {parsedProprietarios.length} Proprietários</span>
                  </Button>
                </div>
              </div>
            )}

            {resultadoProprietarios && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs animate-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                      Importação de Proprietários Concluída!
                    </h4>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                      • <strong>{resultadoProprietarios.novos}</strong> novos proprietários cadastrados.
                      {resultadoProprietarios.ignorados > 0 && ` • ${resultadoProprietarios.ignorados} ignorados (já cadastrados).`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO C: IMPORTAÇÃO DE IMÓVEIS (EXCEL & FEED XML KENLO)      */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {secaoAtiva === 'imoveis' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Central de Importação de Imóveis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Escolha entre enviar uma planilha Excel ou sincronizar automaticamente via Feed XML do Kenlo / Portais.
            </p>

            {/* Sub-abas de Imóveis */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setAbaImovel('xml')}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  abaImovel === 'xml'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Opção 1: Feed XML (Kenlo / Portais)</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaImovel('excel')}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  abaImovel === 'excel'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Opção 2: Planilha Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* SUB-ABA 1: FEED XML KENLO */}
          {abaImovel === 'xml' && (
            <form onSubmit={handleImportarFeedXML} className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Sincronização Rápida com Kenlo e Portais Imobiliários
                </p>
                <p className="text-sky-800/90 dark:text-sky-300 text-[11px] leading-relaxed">
                  Cole o link do Feed XML do seu CRM (Kenlo, VivaReal, Zap, etc.). O sistema lê as tags <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded font-mono">&lt;CodigoImovel&gt;</code>, cadastra novos imóveis com fotos e ignora duplicidades.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  URL do Feed XML (Kenlo / Portais):
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="url"
                    value={xmlUrl}
                    onChange={(e) => setXmlUrl(e.target.value)}
                    placeholder="https://feed.kenlo.com.br/integracao/carga.xml ou https://seucrm.com/feed.xml"
                    className="pl-10 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkAtualizarXML"
                  checked={atualizarExistentesXML}
                  onChange={(e) => setAtualizarExistentesXML(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <label htmlFor="chkAtualizarXML" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  Atualizar dados de imóveis já existentes (com o mesmo código) em vez de apenas ignorá-los
                </label>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoadingXML}
                  disabled={isLoadingXML || !xmlUrl.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer shadow-md"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingXML ? 'animate-spin' : ''}`} />
                  <span>{isLoadingXML ? 'Processando Feed XML...' : '🚀 Importar Imóveis do XML'}</span>
                </Button>
              </div>

              {/* Resultado Detalhado do XML */}
              {resultadoXML && (
                <div className="space-y-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 animate-in zoom-in-95 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h4 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm">
                      Relatório de Processamento do Feed XML
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/60 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total no Feed</span>
                      <strong className="text-lg font-black text-slate-900 dark:text-slate-100">{resultadoXML.totalEncontrados}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Novos Cadastrados</span>
                      <strong className="text-lg font-black text-emerald-700 dark:text-emerald-300">+{resultadoXML.novosCadastrados}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Já Existentes</span>
                      <strong className="text-lg font-black text-slate-700 dark:text-slate-300">{resultadoXML.jaExistentesIgnorados}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Atualizados</span>
                      <strong className="text-lg font-black text-sky-600 dark:text-sky-400">{resultadoXML.atualizados}</strong>
                    </div>
                  </div>

                  {resultadoXML.resumo && resultadoXML.resumo.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="font-bold text-emerald-950 dark:text-emerald-200 text-[11px] block">
                        Amostra dos Códigos Processados:
                      </span>
                      <div className="max-h-36 overflow-y-auto rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-2 space-y-1">
                        {resultadoXML.resumo.map((r, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{r.codigo}</span>
                            <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs">{r.titulo}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                r.status === 'novo'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : r.status === 'atualizado'
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {r.status === 'novo' ? 'Novo' : r.status === 'atualizado' ? 'Atualizado' : 'Ignorado'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {/* SUB-ABA 2: EXCEL DE IMÓVEIS */}
          {abaImovel === 'excel' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-slate-100">Modelo de Importação de Imóveis:</strong> Baixe a planilha com todas as colunas estruturadas (Código, Título, Valores, Fotos, Endereço e Proprietário).
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadModeloImoveisXLSX}
                  className="shrink-0 font-bold text-xs border-emerald-600/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Planilha Modelo de Imóveis (.xlsx)</span>
                </Button>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Selecione o arquivo da planilha de imóveis:
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/30">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChangeImoveisExcel}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {fileImoveis ? fileImoveis.name : 'Arraste ou clique para selecionar a planilha de imóveis'}
                    </p>
                    <p className="text-xs text-slate-500">Formatos suportados: .xlsx, .xls ou .csv</p>
                  </div>
                </div>

                {parsedImoveis.length > 0 && (
                  <div className="space-y-4 pt-2 animate-in fade-in">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <strong>{parsedImoveis.length}</strong> imóveis prontos para importação.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setParsedImoveis([]);
                          setFileImoveis(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Limpar
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                          <tr>
                            <th className="p-2.5">Código</th>
                            <th className="p-2.5">Título</th>
                            <th className="p-2.5">Tipo</th>
                            <th className="p-2.5">Bairro</th>
                            <th className="p-2.5">Valor Venda</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                          {parsedImoveis.slice(0, 10).map((r, i) => (
                            <tr key={i}>
                              <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">{r['Código'] || r['Codigo'] || '—'}</td>
                              <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">{r['Título'] || r['Titulo'] || '—'}</td>
                              <td className="p-2.5">{r['Tipo'] || '—'}</td>
                              <td className="p-2.5">{r['Bairro'] || '—'}</td>
                              <td className="p-2.5 font-bold text-emerald-600">{r['Valor Venda'] ? formatCurrency(Number(r['Valor Venda'])) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleImportarImoveisExcel}
                        isLoading={isLoadingImoveisExcel}
                        disabled={isLoadingImoveisExcel}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer shadow-md"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Importar {parsedImoveis.length} Imóveis</span>
                      </Button>
                    </div>
                  </div>
                )}

                {resultadoImoveisExcel && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs animate-in zoom-in-95">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                          Importação de Imóveis Concluída!
                        </h4>
                        <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                          • <strong>{resultadoImoveisExcel.novos}</strong> novos imóveis cadastrados.
                          {resultadoImoveisExcel.ignorados > 0 && ` • ${resultadoImoveisExcel.ignorados} ignorados (códigos já existentes).`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
