# 🏢 EasyMob — Plataforma de Gestão de Visitas, CRM & Automações Imobiliárias

> **Versão:** 1.0.0 (Produção)  
> **Arquitetura:** Multi-Tenant White-Label, Multi-Instância WhatsApp, PWA Offline-First  
> **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Evolution API  

---

## 📌 1. Visão Geral do Sistema

A **EasyMob** é uma plataforma SaaS imobiliária moderna e completa desenvolvida para automatizar o ciclo de atendimento ao cliente, simplificar a gestão de roteiros de visitas, integrar funil de vendas (CRM) e assegurar a comprovação jurídica/operacional dos atendimentos realizados por corretores via WhatsApp.

### Principais Pilares da Plataforma:
1. **Gestão Inteligente de Visitas & Roteiros Multi-Imóveis:** Organização de visitas com múltiplos imóveis em um único roteiro, rotas de navegação (Google Maps / Waze) e orientações de portaria/chaves.
2. **Régua de Notificações WhatsApp Multicanal:** Disparos automáticos de confirmação, lembretes de 1 hora antes e follow-up pós-visita para **Clientes** e **Proprietários**, disparados pela instância conectada do próprio corretor.
3. **Comprovante de Atendimento & Auditoria Contínua (48h):** Gravação criptografada (AES-256) das mensagens trocadas via WhatsApp, ativa desde o agendamento até 48 horas após a conclusão da visita, gerando **Relatórios de Atendimento certificados em PDF**.
4. **CRM Imobiliário (Kanban):** Funil de vendas interativo para qualificação e conversão de leads.
5. **Multi-Tenant White-Label:** Isolamento completo de dados por imobiliária, personalização visual e permissões por perfil.
6. **Compatibilidade PWA:** Instalável como aplicativo nativo em iOS (Safari) e Android/Desktop.

---

## 🏗️ 2. Arquitetura Técnica & Stack de Tecnologias

```
[ Cliente / Corretor (PWA & Web) ]
               │
               ▼
[ Next.js 16 App Router (React 19 + TypeScript) ]
       ├── Database & Auth: Supabase (PostgreSQL + RLS)
       ├── WhatsApp Gateway: Evolution API (Multi-Instância)
       ├── Geração Documental: jsPDF / AutoTable (PDFs Certificados)
       └── Automações & Crons: /api/cron/lembretes
```

### Tecnologias Utilizadas:
* **Frontend / Framework:** Next.js 16 (App Router, Turbopack, React 19, Server & Client Components).
* **Linguagem & Tipagem:** TypeScript 5 com validação estrita.
* **Estilização & UI:** Tailwind CSS, Dark/Light Mode, Lucide Icons, Glassmorphism e Design System responsivo.
* **Banco de Dados & Autenticação:** Supabase (PostgreSQL, Row Level Security - RLS, UUIDs, Indexes e Triggers).
* **WhatsApp Gateway:** Evolution API v2 (Instâncias individuais por corretor, QR Code, Webhooks e envio com retentativa).
* **Segurança & Criptografia:** Criptografia simétrica AES-256 para dados sensíveis de conversas no banco de dados.
* **Exportação Documental:** jsPDF e `jspdf-autotable` para relatórios certificados em formato PDF A4.
* **Mobile / PWA:** Service Worker (`sw.js`), `manifest.json`, ícones multi-resolução e tags para iOS/Safari standalone.

---

## 📱 3. Módulos e Funcionalidades Detalhadas

---

### 3.1. Módulo de Visitas & Roteiros

O módulo central da plataforma permite planejar, acompanhar e auditar compromissos imobiliários.

#### A. Criação de Visitas (`NovaVisitaModal`)
* **Seleção de Múltiplos Imóveis:** Permite criar roteiros agrupando vários imóveis para o mesmo cliente.
* **Divisão de Notificações WhatsApp:**
  * `[ X ] Enviar confirmação ao Cliente`
  * `[ X ] Enviar confirmação ao Proprietário`
  * `[ X ] Enviar lembrete (1h antes) ao Cliente`
  * `[ X ] Enviar lembrete (1h antes) ao Proprietário`
* **Gravação de Histórico (Comprovante de Atendimento) Separada:**
  * `[ X ] Gravar Histórico do Atendimento (Cliente)`
  * `[ X ] Gravar Histórico do Atendimento (Proprietário)`

#### B. Modal de Conclusão Rápida (`ConcluirVisitaModal`)
* Layout ultra compacto acionado ao finalizar a visita:
  * `[ X ] Enviar WhatsApp pós-visita ao Cliente (Pedir feedback)`
  * `[ X ] Enviar WhatsApp de comprovação ao Proprietário`
* Ao confirmar, a visita é marcada como **Concluída**, agenda a expiração dos logs para **+48 horas** e dispara as mensagens configuradas.

#### C. Ficha do Roteiro de Visitas (`VisitaDetalhesModal`)
* **Cards dos Imóveis:** Fotos, valores (venda/locação), endereço com atalhos para **Waze** e **Google Maps**, dados do proprietário com link de WhatsApp e instruções de chaves/portaria.
* **Régua de Notificações em 3 Etapas:**
  1. `1. Confirmação (Imediato)`
  2. `2. Lembrete (1h Antes)`
  3. `3. Pós-Visita (Na Conclusão)`
  * Exibe o status individualizado por destinatário (`Cliente: ✓ Enviado`, `Proprietário: ⏳ Agendado` ou `🚫 N/A`).
  * **Atalho Rápido de Disparo Manual:** Botão verde com o ícone oficial do WhatsApp (`WhatsAppIcon`) ao lado de cada destinatário que abre o WhatsApp com a mensagem do template compilada dinamicamente.
* **Relatório de Atendimento e Histórico em Accordion Dual:**
  * `👤 Histórico WhatsApp — Cliente`: Sanfona expansível com as mensagens trocadas com o cliente e botão dedicado `[ 📄 Exportar PDF ]`.
  * `🏠 Histórico WhatsApp — Proprietário`: Sanfona expansível com as mensagens trocadas com o proprietário e botão dedicado `[ 📄 Exportar PDF ]`.

---

### 3.2. Régua de Automações & Templates WhatsApp

A plataforma possui 6 templates padrão customizáveis em **Configurações > WhatsApp**:

| # | Template | Destinatário | Gatilho |
|---|---|---|---|
| 1 | **Confirmação (Cliente)** | Cliente | Imediatamente na criação da visita |
| 2 | **Confirmação (Proprietário)** | Proprietário | Imediatamente na criação da visita |
| 3 | **Lembrete 1h (Cliente)** | Cliente | 1 hora antes da visita (`/api/cron/lembretes`) |
| 4 | **Lembrete 1h (Proprietário)** | Proprietário | 1 hora antes da visita (`/api/cron/lembretes`) |
| 5 | **Comprovação de Visita (Proprietário)** | Proprietário | No momento da conclusão da visita |
| 6 | **Pós-Visita / Feedback (Cliente)** | Cliente | No momento da conclusão da visita |

#### Variáveis Dinâmicas Suportadas:
* `{cliente_nome}`, `{cliente_telefone}`
* `{proprietario_nome}`, `{proprietario_telefone}`
* `{imovel_titulo}`, `{imovel_codigo}`, `{endereco}`, `{roteiro_imoveis}`, `{total_imoveis}`
* `{data_hora}`, `{data}`, `{horario}`
* `{corretor_nome}`, `{corretor_telefone}`
* `{link_mapa}`, `{link_curto_mapa}`

#### Multi-Instância por Corretor:
Cada corretor pode conectar seu próprio WhatsApp via QR Code em seu perfil. Todas as visitas criadas por ele utilizarão a sua instância correspondente (`user.instance_name`), garantindo comunicação humanizada e direta.

---

### 3.3. Comprovante de Atendimento & Logs Criptografados (48h)

* **Gravação Contínua:** O webhook (`/api/whatsapp/webhook`) intercepta mensagens de texto, áudios e imagens recebidas e enviadas via WhatsApp.
* **Filtro de Destinatário:**
  * Conversas com clientes são registradas se `gravar_logs_cliente !== false`.
  * Conversas com proprietários são registradas se `gravar_logs_proprietario !== false`.
* **Janela Temporal:** As mensagens continuam sendo salvas continuamente até **48 horas após a conclusão/cancelamento** da visita (`fim_gravacao_logs_em`).
* **Segurança:** O texto das mensagens é armazenado com criptografia **AES-256** no banco de dados e descriptografado em memória exclusivamente no momento da leitura/geração de relatório.
* **Geração de PDF Certificado:**
  * Exporta cabeçalho com identificador hash SHA-256 do documento.
  * Tabela cronológica completa com remetente, horário e ID da mensagem da Meta.
  * Termo de integridade e conformidade legal com o **Marco Civil da Internet (Lei 12.965/2014, Art. 7)** e **LGPD (Lei 13.709/2018)**.

---

### 3.4. CRM Imobiliário (Funil de Vendas Kanban)

O CRM permite acompanhar os leads em cada etapa comercial:
1. **Novos Leads:** Contatos recém-chegados (WhatsApp, Site, Portais).
2. **Qualificação:** Análise de perfil, faixa de orçamento e interesse.
3. **Agendamento de Visita:** Visitas marcadas no calendário.
4. **Proposta / Negociação:** Elaboração e envio de propostas de compra ou locação.
5. **Documentação / Crédito:** Coleta de documentos e aprovação de financiamento.
6. **Fechamento / Contrato:** Emissão e assinatura contratual.
7. **Venda / Locação Concluída:** Negócio fechado e comissão gerada.

---

### 3.5. Gestão de Imóveis e Proprietários

* **Imóveis:** Código de referência, finalidade (Venda/Locação), tipo (Apartamento, Casa, Cobertura, Comercial), endereço completo, fotos em carrossel, valores de IPTU e condomínio, instruções de acesso e chaves.
* **Ficha Pública do Imóvel (`/imovel/[id]`):** Página limpa e otimizada para envio a clientes, com galeria de fotos, mapa e botão de contato direto no WhatsApp.
* **Proprietários:** Registro unificado com dados de contato, documento, chave PIX, dados bancários e contagem de imóveis vinculados.

---

### 3.6. Gestão Multi-Tenant e Perfis de Acesso

* **Isolamento por Imobiliária:** Todos os registros possuem `imobiliaria_id` / `tenant_id`.
* **Perfis de Usuário:**
  * `master_admin`: Administrador global da plataforma (gestão de imobiliárias e infraestrutura).
  * `admin`: Gestor da imobiliária (acesso total aos imóveis, equipe, relatórios e automações da sua imobiliária).
  * `corretor`: Operador (gestão dos seus clientes, visitas, funil e conexão do seu próprio WhatsApp).
* **Convites de Equipe (`/api/invites`):** Envio de convites por e-mail/link com token seguro para novos corretores.

---

## ⚙️ 4. Configuração, Instalação e Execução

### 4.1. Pré-requisitos
* **Node.js:** Versão 18.18+ ou 20+
* **Banco de Dados:** Projeto ativo no [Supabase](https://supabase.com)
* **WhatsApp Gateway:** Instância da [Evolution API](https://github.com/EvolutionAPI/evolution-api)

### 4.2. Variáveis de Ambiente (`.env.local`)

```env
# URL base da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Banco de Dados e Auth)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Evolution API (WhatsApp Gateway)
NEXT_PUBLIC_EVOLUTION_API_URL=http://seu-servidor-evolution:8080
EVOLUTION_API_GLOBAL_KEY=sua-chave-global-aqui

# Criptografia de Logs (Chave AES-256 de 32 bytes)
ENCRYPTION_SECRET_KEY=chave_secreta_de_32_caracteres_min

# Segurança do Cron Job
CRON_SECRET=token_secreto_para_cron_jobs
```

### 4.3. Instalação e Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Executar verificação de tipos e build de produção
npm run build

# 4. Iniciar servidor de produção
npm run start
```

---

## 🔒 5. Políticas de Segurança e Conformidade

1. **Proteção de Dados Pessoais (LGPD):** Criptografia de conversas armazenadas, possibilidade de desativação manual da gravação por visita e controle de expiração dos registros em 48h.
2. **Autenticação:** Sessões seguras via JWT e cookies HttpOnly com renovação automática.
3. **PWA Standalone:** Isolamento de contexto no Safari/Chrome Mobile e proteção contra injeção de scripts.
