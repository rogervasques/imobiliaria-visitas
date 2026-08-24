'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { MultiImageUpload } from '../ui/MultiImageUpload';
import { useData } from '@/context/DataContext';
import { TipoImovel, FinalidadeImovel, StatusImovel } from '@/types';
import { Building2, Save, Sparkles, ShieldCheck, Check } from 'lucide-react';

interface NovoImovelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CARACTERISTICAS_OPCOES = [
  'Água',
  'Ar condicionado',
  'Aquecimento solar',
  'Armários (cozinha/quarto)',
  'Churrasqueira',
  'Piscina',
  'Área de serviço',
  'Lavabo',
  'Varanda gourmet',
  'Academia',
  'Portaria 24h',
  'Elevador',
  'Quintal',
  'Playground',
  'Quadra poliesportiva',
  'Energia solar',
];

export function NovoImovelModal({ isOpen, onClose }: NovoImovelModalProps) {
  const { adicionarImovel, proprietarios } = useData();

  // Estados dos Campos
  const [codigo, setCodigo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoImovel>('apartamento');
  const [finalidade, setFinalidade] = useState<FinalidadeImovel>('venda');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('São Paulo');
  const [estado, setEstado] = useState('SP');
  const [cep, setCep] = useState('');

  // 1. Financeiro
  const [valorVenda, setValorVenda] = useState('');
  const [valorLocacao, setValorLocacao] = useState('');
  const [valorCondominio, setValorCondominio] = useState('');
  const [valorIptu, setValorIptu] = useState('');

  // 2. Detalhamento Físico (Métricas)
  const [areaConstruida, setAreaConstruida] = useState('');
  const [areaTerreno, setAreaTerreno] = useState('');
  const [quartos, setQuartos] = useState('3');
  const [suites, setSuites] = useState('1');
  const [banheiros, setBanheiros] = useState('2');
  const [vagas, setVagas] = useState('2');
  const [aceitaPet, setAceitaPet] = useState<boolean>(true);

  // 3. Descrição Comercial & Características
  const [descricaoComercial, setDescricaoComercial] = useState('');
  const [caracteristicasSelecionadas, setCaracteristicasSelecionadas] = useState<string[]>([
    'Água',
    'Ar condicionado',
    'Churrasqueira',
    'Área de serviço',
  ]);

  // 4. Proprietário & Acesso
  const [proprietarioId, setProprietarioId] = useState<string | null>(null);
  const [proprietarioNome, setProprietarioNome] = useState('');
  const [proprietarioTelefone, setProprietarioTelefone] = useState('');
  const [proprietarioEmail, setProprietarioEmail] = useState('');
  const [showPropSuggestions, setShowPropSuggestions] = useState(false);
  const [observacoesChaves, setObservacoesChaves] = useState('');
  const [status, setStatus] = useState<StatusImovel>('disponivel');
  const [imagemUrl, setImagemUrl] = useState('');
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sugestoesProprietarios = proprietarios.filter(
    (p) =>
      p.nome.toLowerCase().includes(proprietarioNome.toLowerCase()) ||
      p.telefone.includes(proprietarioNome)
  );

  const toggleCaracteristica = (item: string) => {
    setCaracteristicasSelecionadas((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !endereco || !bairro || !proprietarioNome || !proprietarioTelefone) return;

    setIsSubmitting(true);
    try {
      const capaFinal = imagemUrl || fotosUrls[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
      const fotosFinais = fotosUrls.length > 0 ? fotosUrls : [capaFinal];

      await adicionarImovel({
        codigo: codigo || `IM-${Math.floor(1000 + Math.random() * 9000)}`,
        titulo,
        tipo,
        finalidade,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        valor_venda: valorVenda ? parseFloat(valorVenda) : null,
        valor_locacao: valorLocacao ? parseFloat(valorLocacao) : null,
        valor_condominio: valorCondominio ? parseFloat(valorCondominio) : null,
        valor_iptu: valorIptu ? parseFloat(valorIptu) : null,
        area_construida: areaConstruida ? parseFloat(areaConstruida) : null,
        area_util: areaConstruida ? parseFloat(areaConstruida) : null,
        area_terreno: areaTerreno ? parseFloat(areaTerreno) : null,
        quartos: parseInt(quartos, 10) || 0,
        suites: parseInt(suites, 10) || 0,
        banheiros: parseInt(banheiros, 10) || 0,
        vagas: parseInt(vagas, 10) || 0,
        aceita_pet: aceitaPet,
        descricao_comercial: descricaoComercial,
        caracteristicas: caracteristicasSelecionadas,
        proprietario_id: proprietarioId || undefined,
        proprietario_nome: proprietarioNome,
        proprietario_telefone: proprietarioTelefone,
        proprietario_email: proprietarioEmail,
        observacoes_chaves: observacoesChaves,
        status,
        imagem_url: capaFinal,
        fotos_urls: fotosFinais,
      });
      onClose();
    } catch (err) {
      console.error('Erro ao adicionar imóvel:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Imóvel"
      subtitle="Insira os dados técnicos, comerciais, métricas e informações do proprietário"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identificação Básica */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Código de Referência"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: AP-1024"
            />
            <Select
              label="Tipo de Imóvel"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoImovel)}
            >
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="cobertura">Cobertura</option>
              <option value="comercial">Comercial</option>
              <option value="terreno">Terreno</option>
            </Select>
            <Select
              label="Finalidade"
              value={finalidade}
              onChange={(e) => setFinalidade(e.target.value as FinalidadeImovel)}
            >
              <option value="venda">Venda</option>
              <option value="locacao">Locação</option>
              <option value="ambos">Venda & Locação</option>
            </Select>
          </div>

          <Input
            label="Título do Anúncio *"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Apartamento Alto Padrão com Vista Panorâmica"
          />
        </div>

        {/* Localização */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Endereço &amp; Localização
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Endereço / Logradouro *"
                required
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Avenida Paulista"
              />
            </div>
            <Input
              label="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex: 1500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Complemento"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              placeholder="Ex: Apto 182"
            />
            <Input
              label="Bairro *"
              required
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Ex: Bela Vista"
            />
            <Input
              label="Cidade *"
              required
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="São Paulo"
            />
            <Input
              label="Estado *"
              required
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="SP"
            />
          </div>
        </div>

        {/* 1. Sessão de Valores (Financeiro) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-500 font-black">$</span>
            Valores &amp; Custos Mensais
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Valor de Venda (R$)"
              type="number"
              value={valorVenda}
              onChange={(e) => setValorVenda(e.target.value)}
              placeholder="Ex: 1450000"
            />
            <Input
              label="Valor de Locação (R$)"
              type="number"
              value={valorLocacao}
              onChange={(e) => setValorLocacao(e.target.value)}
              placeholder="Ex: 6500"
            />
            <Input
              label="Condomínio (R$)"
              type="number"
              value={valorCondominio}
              onChange={(e) => setValorCondominio(e.target.value)}
              placeholder="Ex: 1200"
            />
            <Input
              label="IPTU (R$)"
              type="number"
              value={valorIptu}
              onChange={(e) => setValorIptu(e.target.value)}
              placeholder="Ex: 450"
            />
          </div>
        </div>

        {/* 2. Detalhamento Físico do Imóvel (Métricas) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detalhamento Físico &amp; Métricas
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Área Construída (m²)"
              type="number"
              value={areaConstruida}
              onChange={(e) => setAreaConstruida(e.target.value)}
              placeholder="Ex: 128"
            />
            <Input
              label="Área do Terreno (m²)"
              type="number"
              value={areaTerreno}
              onChange={(e) => setAreaTerreno(e.target.value)}
              placeholder="Ex: 250"
            />
            <Input
              label="Quartos"
              type="number"
              min="0"
              value={quartos}
              onChange={(e) => setQuartos(e.target.value)}
            />
            <Input
              label="Suítes"
              type="number"
              min="0"
              value={suites}
              onChange={(e) => setSuites(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Banheiros"
              type="number"
              min="0"
              value={banheiros}
              onChange={(e) => setBanheiros(e.target.value)}
            />
            <Input
              label="Vagas de Garagem"
              type="number"
              min="0"
              value={vagas}
              onChange={(e) => setVagas(e.target.value)}
            />
            <Select
              label="Aceita Pet?"
              value={aceitaPet ? 'sim' : 'nao'}
              onChange={(e) => setAceitaPet(e.target.value === 'sim')}
            >
              <option value="sim">🐾 Sim, Aceita Pet</option>
              <option value="nao">🚫 Não Aceita Pet</option>
            </Select>
          </div>
        </div>

        {/* 3. Nova Sessão: Descrição e Características */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Descrição Comercial &amp; Comodidades
          </h4>

          <Textarea
            label="Descrição Comercial do Imóvel"
            rows={3}
            value={descricaoComercial}
            onChange={(e) => setDescricaoComercial(e.target.value)}
            placeholder="Descreva os diferenciais, vista, acabamentos, sol da manhã/tarde, iluminação e diferenciais exclusivos..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Características &amp; Comodidades (Seleção Múltipla):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CARACTERISTICAS_OPCOES.map((item) => {
                const isSelected = caracteristicasSelecionadas.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleCaracteristica(item)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fotos do Imóvel (Upload Múltiplo & Galeria) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <MultiImageUpload
            label="Galeria de Fotos do Imóvel"
            fotos={fotosUrls}
            capaUrl={imagemUrl}
            onChange={(novasFotos, novaCapa) => {
              setFotosUrls(novasFotos);
              setImagemUrl(novaCapa);
            }}
          />
        </div>

        {/* 4. Proprietário & Instruções de Chaves (Uso Interno com Destaque e Autocomplete) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Proprietário &amp; Acesso — Uso Interno
              </span>
            </div>
            {proprietarioId ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ Proprietário Vinculado
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Novo Proprietário
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Campo Inteligente de Autocomplete de Proprietário */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Nome do Proprietário *
              </label>
              <input
                required
                type="text"
                value={proprietarioNome}
                onChange={(e) => {
                  setProprietarioNome(e.target.value);
                  setProprietarioId(null);
                  setShowPropSuggestions(true);
                }}
                onFocus={() => setShowPropSuggestions(true)}
                placeholder="Digite para buscar ou cadastrar..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />

              {/* Sugestões do Autocomplete */}
              {showPropSuggestions && proprietarioNome.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {sugestoesProprietarios.length > 0 ? (
                    <div className="divide-y divide-slate-800">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                        Proprietários Cadastrados
                      </div>
                      {sugestoesProprietarios.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setProprietarioId(p.id);
                            setProprietarioNome(p.nome);
                            setProprietarioTelefone(p.telefone);
                            setProprietarioEmail(p.email || '');
                            setShowPropSuggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-950/40 flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-100 block">{p.nome}</span>
                            <span className="text-[11px] text-slate-400">{p.telefone}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/20">
                            Selecionar
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {/* Opção de Criar Novo */}
                  <button
                    type="button"
                    onClick={() => {
                      setProprietarioId(null);
                      setShowPropSuggestions(false);
                    }}
                    className="w-full px-3 py-2.5 text-left bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border-t border-slate-800 transition-colors"
                  >
                    <span>+ Cadastrar novo proprietário:</span>
                    <span className="text-white underline">{proprietarioNome}</span>
                  </button>
                </div>
              )}
            </div>

            <Input
              label="WhatsApp do Proprietário *"
              required
              value={proprietarioTelefone}
              onChange={(e) => setProprietarioTelefone(e.target.value)}
              placeholder="11987654321"
            />
            <Input
              label="E-mail do Proprietário"
              type="email"
              value={proprietarioEmail}
              onChange={(e) => setProprietarioEmail(e.target.value)}
              placeholder="carlos@email.com"
            />
          </div>

          <Textarea
            label="Orientações sobre Chaves & Portaria (Visível apenas para corretores)"
            value={observacoesChaves}
            onChange={(e) => setObservacoesChaves(e.target.value)}
            placeholder="Ex: Chaves na portaria com o zelador Francisco. Avisar com 1h de antecedência..."
            rows={2}
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <Save className="w-4 h-4 mr-1.5" />
            Salvar Imóvel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
