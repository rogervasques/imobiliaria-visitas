import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { supabase } from '@/lib/supabase';
import { Imovel, TipoImovel, FinalidadeImovel } from '@/types';

// Helper para normalizar números
function parseNumber(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = String(val).replace(/[^\d.,-]/g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// Helper para normalizar tipo de imóvel
function normalizarTipo(tipoRaw: string = ''): TipoImovel {
  const t = tipoRaw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('apart') || t.includes('apto') || t.includes('flat') || t.includes('studio') || t.includes('kitnet')) {
    return 'apartamento';
  }
  if (t.includes('cobert') || t.includes('penthouse') || t.includes('duplex')) {
    return 'cobertura';
  }
  if (t.includes('terreno') || t.includes('lote')) {
    return 'terreno';
  }
  if (t.includes('comercial') || t.includes('sala') || t.includes('loja') || t.includes('galp') || t.includes('predio') || t.includes('escritorio')) {
    return 'comercial';
  }
  return 'casa';
}

// Helper para normalizar finalidade
function normalizarFinalidade(venda?: number | null, locacao?: number | null, transType?: string): FinalidadeImovel {
  if (transType) {
    const tt = transType.toLowerCase();
    if (tt.includes('sale') || tt.includes('venda')) return (locacao && locacao > 0) ? 'ambos' : 'venda';
    if (tt.includes('rent') || tt.includes('loca') || tt.includes('aluguel')) return (venda && venda > 0) ? 'ambos' : 'locacao';
  }
  const temVenda = (venda !== null && venda !== undefined && venda > 0);
  const temLocacao = (locacao !== null && locacao !== undefined && locacao > 0);

  if (temVenda && temLocacao) return 'ambos';
  if (temLocacao) return 'locacao';
  return 'venda';
}

// Helper recursivo para extrair lista de URLs de fotos do XML
function extrairFotosUrls(node: any): string[] {
  const urls: string[] = [];

  function walk(curr: any) {
    if (!curr) return;
    if (typeof curr === 'string') {
      const trimmed = curr.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        urls.push(trimmed);
      }
      return;
    }
    if (Array.isArray(curr)) {
      curr.forEach(walk);
      return;
    }
    if (typeof curr === 'object') {
      if (curr.URLArquivo && typeof curr.URLArquivo === 'string') {
        urls.push(curr.URLArquivo.trim());
      } else if (curr.URL && typeof curr.URL === 'string') {
        urls.push(curr.URL.trim());
      } else if (curr['#text'] && typeof curr['#text'] === 'string' && curr['#text'].startsWith('http')) {
        urls.push(curr['#text'].trim());
      } else {
        Object.values(curr).forEach(walk);
      }
    }
  }

  walk(node);
  return Array.from(new Set(urls));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, imobiliaria_id, imobiliaria_nome, atualizarExistentes = false } = body;

    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'URL do Feed XML inválida. Forneça um link completo iniciando com http:// ou https://' },
        { status: 400 }
      );
    }

    console.log(`[Importação XML] Iniciando fetch da URL: ${url}`);

    // 1. Fetch do Feed XML com timeout e headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 segundos

    let xmlText = '';
    try {
      const response = await fetch(url.trim(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'EasyMob-XML-Importer/1.0 (+https://easymob.com.br)',
          'Accept': 'application/xml, text/xml, */*',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `Erro ao acessar o Feed XML (HTTP ${response.status}: ${response.statusText})` },
          { status: 400 }
        );
      }

      xmlText = await response.text();
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'O servidor do Feed XML demorou mais de 35 segundos para responder (Timeout).' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Não foi possível conectar ao servidor do XML: ${fetchErr.message}` },
        { status: 502 }
      );
    }

    if (!xmlText || xmlText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O Feed XML retornado está vazio.' },
        { status: 400 }
      );
    }

    // 2. Parser com Fast XML Parser
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      trimValues: true,
      parseTagValue: false,
    });

    let jsonObj: any;
    try {
      jsonObj = parser.parse(xmlText);
    } catch (parseErr: any) {
      return NextResponse.json(
        { success: false, error: `Falha ao interpretar o arquivo XML: ${parseErr.message}` },
        { status: 422 }
      );
    }

    // 3. Localiza o nó com a lista de imóveis no XML
    let imoveisRawList: any[] = [];

    // Formato Kenlo: <Carga><Imoveis><Imovel>...</Imovel></Imoveis></Carga>
    if (jsonObj?.Carga?.Imoveis?.Imovel) {
      const item = jsonObj.Carga.Imoveis.Imovel;
      imoveisRawList = Array.isArray(item) ? item : [item];
    }
    // Formato Portal VivaReal / Zap: <ListingDataFeed><Listings><Listing>...</Listing></Listings></ListingDataFeed>
    else if (jsonObj?.ListingDataFeed?.Listings?.Listing) {
      const item = jsonObj.ListingDataFeed.Listings.Listing;
      imoveisRawList = Array.isArray(item) ? item : [item];
    }
    // Formato Alternativo: <Listings><Listing>
    else if (jsonObj?.Listings?.Listing) {
      const item = jsonObj.Listings.Listing;
      imoveisRawList = Array.isArray(item) ? item : [item];
    }
    // Formato Direto: <Imoveis><Imovel>
    else if (jsonObj?.Imoveis?.Imovel) {
      const item = jsonObj.Imoveis.Imovel;
      imoveisRawList = Array.isArray(item) ? item : [item];
    }
    // Formato Genérico: Procura por nós chamados Imovel ou Listing recursivamente
    else {
      function findImoveis(obj: any) {
        if (!obj || typeof obj !== 'object') return;
        if (obj.Imovel) {
          imoveisRawList = Array.isArray(obj.Imovel) ? obj.Imovel : [obj.Imovel];
          return;
        }
        if (obj.Listing) {
          imoveisRawList = Array.isArray(obj.Listing) ? obj.Listing : [obj.Listing];
          return;
        }
        for (const key of Object.keys(obj)) {
          if (imoveisRawList.length > 0) break;
          findImoveis(obj[key]);
        }
      }
      findImoveis(jsonObj);
    }

    if (imoveisRawList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum imóvel encontrado na estrutura do XML. Verifique se o Feed é do Kenlo ou padrão de Portais imobiliários (Carga/Imoveis/Imovel ou Listings/Listing).',
        },
        { status: 400 }
      );
    }

    console.log(`[Importação XML] Total de itens brutos identificados: ${imoveisRawList.length}`);

    // 4. Busca imóveis existentes no Supabase para verificação de duplicidade
    let existingCodigos = new Set<string>();
    let existingMapByCodigo = new Map<string, string>(); // codigo -> id

    try {
      let query = supabase.from('imoveis').select('id, codigo');
      if (imobiliaria_id) {
        query = query.eq('imobiliaria_id', imobiliaria_id);
      }
      const { data: dbExisting } = await query;
      if (dbExisting) {
        dbExisting.forEach((imo) => {
          if (imo.codigo) {
            const cleanCod = String(imo.codigo).trim().toUpperCase();
            existingCodigos.add(cleanCod);
            existingMapByCodigo.set(cleanCod, imo.id);
          }
        });
      }
    } catch (dbErr) {
      console.warn('[Importação XML] Falha ao consultar códigos existentes:', dbErr);
    }

    // 5. Processamento dos Imóveis
    let novosCadastrados = 0;
    let jaExistentesIgnorados = 0;
    let atualizadosCount = 0;
    let errosCount = 0;
    const novosImoveisParaInserir: any[] = [];
    const resumoProcessados: any[] = [];

    const defaultTenantName = imobiliaria_nome || 'EasyMob Imóveis';

    for (let i = 0; i < imoveisRawList.length; i++) {
      const raw = imoveisRawList[i];
      if (!raw || typeof raw !== 'object') continue;

      try {
        // Extrai código do imóvel
        const rawCod =
          raw.CodigoImovel ||
          raw.Codigo ||
          raw.ListingID ||
          raw.id ||
          raw['@_id'] ||
          raw.Referencia ||
          `IMO-${i + 1}`;
        const codigo = String(rawCod).trim();
        const codigoKey = codigo.toUpperCase();

        // Extrai Valores
        const valorVenda = parseNumber(
          raw.PrecoVenda ||
          raw.ValorVenda ||
          raw.ListPrice ||
          raw.Details?.ListPrice ||
          raw.Preco ||
          raw.Valor
        );
        const valorLocacao = parseNumber(
          raw.PrecoLocacao ||
          raw.ValorLocacao ||
          raw.RentalPrice ||
          raw.Details?.RentalPrice
        );
        const valorCondominio = parseNumber(
          raw.PrecoCondominio ||
          raw.ValorCondominio ||
          raw.PropertyAdministrationFee ||
          raw.Details?.PropertyAdministrationFee
        );
        const valorIptu = parseNumber(
          raw.PrecoIptu ||
          raw.ValorIptu ||
          raw.YearlyTax ||
          raw.Details?.YearlyTax
        );

        // Extrai Características Físicas
        const quartos =
          parseNumber(
            raw.QtdDormitorios ||
            raw.QtdQuartos ||
            raw.Quartos ||
            raw.Bedrooms ||
            raw.Details?.Bedrooms
          ) || 0;
        const suites =
          parseNumber(
            raw.QtdSuites ||
            raw.Suites ||
            raw.Details?.Suites
          ) || 0;
        const banheiros =
          parseNumber(
            raw.QtdBanheiros ||
            raw.Banheiros ||
            raw.Bathrooms ||
            raw.Details?.Bathrooms
          ) || 1;
        const vagas =
          parseNumber(
            raw.QtdVagas ||
            raw.Vagas ||
            raw.Garage ||
            raw.GarageSpaces ||
            raw.Details?.Garage
          ) || 0;
        const areaUtil = parseNumber(
          raw.AreaUtil ||
          raw.AreaPrivativa ||
          raw.LivingArea ||
          raw.Details?.LivingArea
        );
        const areaTotal = parseNumber(
          raw.AreaTotal ||
          raw.AreaConstruida ||
          raw.LotArea ||
          raw.Details?.LotArea
        );

        // Extrai Endereço
        const endereco =
          raw.Endereco ||
          raw.Logradouro ||
          raw.Location?.Address ||
          raw.Location?.Street ||
          'Endereço sob consulta';
        const numero = String(raw.Numero || raw.Location?.StreetNumber || '').trim();
        const complemento = String(raw.Complemento || raw.Location?.Complement || '').trim();
        const bairro =
          raw.Bairro ||
          raw.Location?.Neighborhood ||
          raw.Location?.District ||
          'Bairro Central';
        const cidade =
          raw.Cidade ||
          raw.Location?.City ||
          'São Paulo';
        const estado =
          raw.UF ||
          raw.Estado ||
          raw.Location?.State ||
          raw.Location?.Country?.['@_abbreviation'] ||
          'SP';
        const cep = String(raw.CEP || raw.Location?.PostalCode || '').trim();

        // Extrai Tipo e Finalidade
        const tipoRaw = String(
          raw.TipoImovel ||
          raw.SubTipoImovel ||
          raw.Tipo ||
          raw.PropertyType ||
          raw.Details?.PropertyType ||
          'Apartamento'
        );
        const tipo = normalizarTipo(tipoRaw);
        const finalidade = normalizarFinalidade(
          valorVenda,
          valorLocacao,
          raw.TransactionType || raw.Finalidade
        );

        // Extrai Título e Descrição
        const titulo =
          raw.TituloImovel ||
          raw.Titulo ||
          raw.Title ||
          raw.Details?.Title ||
          `${tipoRaw} com ${quartos} dorms em ${bairro}`;
        const descricao =
          raw.Observacao ||
          raw.Descricao ||
          raw.Description ||
          raw.Details?.Description ||
          '';

        // Extrai Fotos
        const fotosUrls = extrairFotosUrls(raw.Fotos || raw.Media || raw.Imagens || raw.Foto);
        const imagemUrl = fotosUrls[0] || '';

        // Extrai Proprietário (se informado no XML)
        const proprietarioNome =
          raw.NomeProprietario ||
          raw.Proprietario ||
          raw.Contato?.Nome ||
          'Proprietário do Imóvel';
        const proprietarioTelefone =
          raw.TelefoneProprietario ||
          raw.Contato?.Telefone ||
          '';

        const imovelPayload: Partial<Imovel> = {
          codigo,
          titulo: String(titulo).trim(),
          tipo,
          finalidade,
          endereco: String(endereco).trim(),
          numero: numero || undefined,
          complemento: complemento || undefined,
          bairro: String(bairro).trim(),
          cidade: String(cidade).trim(),
          estado: String(estado).trim().toUpperCase(),
          cep: cep || undefined,
          valor_venda: valorVenda,
          valor_locacao: valorLocacao,
          valor_condominio: valorCondominio,
          valor_iptu: valorIptu,
          quartos: Number(quartos),
          suites: Number(suites),
          banheiros: Number(banheiros),
          vagas: Number(vagas),
          area_util: areaUtil,
          area_construida: areaTotal,
          descricao_comercial: descricao ? String(descricao).trim() : null,
          imagem_url: imagemUrl || undefined,
          fotos_urls: fotosUrls.length > 0 ? fotosUrls : undefined,
          proprietario_nome: String(proprietarioNome).trim(),
          proprietario_telefone: String(proprietarioTelefone).trim(),
          status: 'disponivel',
          imobiliaria_id: imobiliaria_id || undefined,
          imobiliaria: defaultTenantName,
        };

        // LÓGICA DE DUPLICIDADE:
        if (existingCodigos.has(codigoKey)) {
          if (atualizarExistentes) {
            const existingId = existingMapByCodigo.get(codigoKey);
            if (existingId) {
              await supabase.from('imoveis').update(imovelPayload).eq('id', existingId);
              atualizadosCount++;
              resumoProcessados.push({ codigo, titulo, status: 'atualizado' });
            }
          } else {
            jaExistentesIgnorados++;
            resumoProcessados.push({ codigo, titulo, status: 'ignorado_existente' });
          }
        } else {
          // Novo Imóvel
          const novoId = crypto.randomUUID ? crypto.randomUUID() : `imovel_${Date.now()}_${i}`;
          const finalItem = {
            ...imovelPayload,
            id: novoId,
            criado_em: new Date().toISOString(),
          };
          novosImoveisParaInserir.push(finalItem);
          existingCodigos.add(codigoKey);
          novosCadastrados++;
          resumoProcessados.push({ codigo, titulo, status: 'novo' });
        }
      } catch (itemErr: any) {
        errosCount++;
        console.warn(`[Importação XML] Erro ao processar item index ${i}:`, itemErr);
      }
    }

    // 6. Inserção em lotes (batch insert de 50 em 50 para máxima velocidade)
    if (novosImoveisParaInserir.length > 0) {
      const BATCH_SIZE = 50;
      for (let i = 0; i < novosImoveisParaInserir.length; i += BATCH_SIZE) {
        const batch = novosImoveisParaInserir.slice(i, i + BATCH_SIZE);
        const { error: insertErr } = await supabase.from('imoveis').insert(batch);
        if (insertErr) {
          console.error('[Importação XML] Erro no batch insert Supabase:', insertErr);
        }
      }
    }

    console.log(`[Importação XML] Concluída: ${novosCadastrados} novos, ${jaExistentesIgnorados} ignorados, ${atualizadosCount} atualizados.`);

    return NextResponse.json({
      success: true,
      totalEncontrados: imoveisRawList.length,
      novosCadastrados,
      jaExistentesIgnorados,
      atualizados: atualizadosCount,
      erros: errosCount,
      novosImoveis: novosImoveisParaInserir,
      resumo: resumoProcessados.slice(0, 50), // Primeiros 50 para feedback rápido
    });
  } catch (error: any) {
    console.error('[Importação XML] Erro geral na rota:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno no processamento do XML: ${error.message}` },
      { status: 500 }
    );
  }
}
