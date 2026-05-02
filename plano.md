# Implementation Plan - Municipal Diária System

Update the system to include all fields required by the official "Solicitação de Diária" form of Lagoa dos Patos (MG).

## User Review Required

> [!IMPORTANT]
> The database schema has been expanded to include all fields from the image. Please confirm if any of these fields should be optional or if there are additional validation rules (e.g., CPF format, specific bank list).

> [!TIP]
> The PDF generation will need to strictly match the layout of the provided image to ensure official validity.

## Proposed Changes

### Database Schema

#### [MODIFY] [schema.ts](file:///c:/Users/PROCON/Documents/projetos/diarias/src/lib/db/schema.ts)
Update the schema to include all missing fields from the official form.

```typescript
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  role: text('role').$default('solicitante').notNull(), // solicitante | adm_diarias | adm_geral
  matricula: text('matricula'),
  unidadeAdministrativa: text('unidade_administrativa'),
  cpf: text('cpf'),
  cargo: text('cargo'),
  bancoNome: text('banco_nome'),
  bancoAgenciaCod: text('banco_agencia_cod'),
  bancoAgenciaNum: text('banco_agencia_num'),
  bancoContaNum: text('banco_conta_num'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const daily_requests = sqliteTable('daily_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  exercicio: integer('exercicio').notNull(),
  dataSolicitacao: integer('data_solicitacao', { mode: 'timestamp' }).notNull(),
  
  // Trip Details
  quantidadeDiarias: real('quantidade_diarias').notNull(),
  tipoDiaria: text('tipo_diaria').notNull(), // Antecipadas | Vencidas | Indenização
  dataSaida: integer('data_saida', { mode: 'timestamp' }).notNull(),
  dataRetorno: integer('data_retorno', { mode: 'timestamp' }).notNull(),
  meioTransporte: text('meio_transporte').notNull(), // Oficial | Avião | Ônibus | Van | Outro
  veiculoOficialPlaca: text('veiculo_oficial_placa'),
  destinoCidadeUf: text('destino_cidade_uf').notNull(),
  
  // Personal Vehicle
  veiculoParticular: integer('veiculo_particular', { mode: 'boolean' }).default(false),
  justificativaVeiculoParticular: text('justificativa_veiculo_particular'),
  distanciaIdaVolta: real('distancia_ida_volta'),
  valorIndenizacaoKm: real('valor_indenizacao_km').default(0.80),
  dadosVeiculoProprio: text('dados_veiculo_proprio'),
  
  objetivoViagem: text('objetivo_viagem').notNull(),
  
  // Values Breakdown
  valorDiariasSolicitado: real('valor_diarias_solicitado').notNull(),
  valorDiariasAprovado: real('valor_diarias_aprovado'),
  valorPassagemSolicitado: real('valor_passagem_solicitado').default(0),
  valorPassagemAprovado: real('valor_passagem_aprovado').default(0),
  valorIndenizacaoTransporteSolicitado: real('valor_indenizacao_transporte_solicitado').default(0),
  valorIndenizacaoTransporteAprovado: real('valor_indenizacao_transporte_aprovado').default(0),
  valorTotalSolicitado: real('valor_total_solicitado').notNull(),
  valorTotalAprovado: real('valor_total_aprovado'),

  status: text('status').$default('pendente').notNull(), // pendente | aprovada | rejeitada
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const accountability_reports = sqliteTable('accountability_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dailyRequestId: integer('daily_request_id').references(() => daily_requests.id).notNull(),
  
  // Trip Reality
  quantidadePernoites: integer('quantidade_pernoites').notNull(),
  dataHoraPartida: integer('data_hora_partida', { mode: 'timestamp' }).notNull(),
  dataHoraChegada: integer('data_hora_chegada', { mode: 'timestamp' }).notNull(),
  relatorioDetalhado: text('relatorio_detalhado').notNull(),
  
  // Declarations & Checklist
  inexistenciaResidenciaPropria: integer('inexistencia_residencia_propria', { mode: 'boolean' }).default(true),
  anexoPassagens: integer('anexo_passagens', { mode: 'boolean' }).default(false),
  anexoCartoesEmbarque: integer('anexo_cartoes_embarque', { mode: 'boolean' }).default(false),
  anexoAutorizacaoVeiculo: integer('anexo_autorizacao_veiculo', { mode: 'boolean' }).default(false),
  anexoComprovanteParticipacao: integer('anexo_comprovante_participacao', { mode: 'boolean' }).default(false),
  
  dataRelatorio: integer('data_relatorio', { mode: 'timestamp' }).notNull(),
  status: text('status').$default('pendente').notNull(), // pendente | aprovada | rejeitada
  
  // Review & Approval (Anexo IV)
  contabilidadeData: integer('contabilidade_data', { mode: 'timestamp' }),
  contabilidadeParecer: text('contabilidade_parecer'),
  homologacaoStatus: text('homologacao_status'), // APROVADA | REPROVADA
  homologacaoData: integer('homologacao_data', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  prefeituraNome: text('prefeitura_nome').notNull(),
  prefeituraEndereco: text('prefeitura_endereco'),
  prefeituraCep: text('prefeitura_cep'),
  prefeituraLei: text('prefeitura_lei'),
  logoUrl: text('logo_url'),
});
```

### UI Components

#### [NEW] DiariaForm.svelte
Create a comprehensive form that mirrors the official document layout, organized into sections:
1.  **Header Settings** (Pre-filled from system settings)
2.  **Server Info** (Auto-filled from user profile: Name, CPF, Cargo, Bank Info)
3.  **Travel Details** (Destination, Objective, Period, Transport)
4.  **Financials** (Automatic calculation based on distances and quantity)

#### [NEW] PrestacaoContasForm.svelte
Create a form for accountability reporting:
1.  **Trip Reality** (Actual departure/arrival dates and times, number of overnights)
2.  **Detailed Report** (Text area for describing activities)
3.  **Checklist** (Yes/No for attached documents)
4.  **Declaration** (Consent for non-residency)

#### [NEW] HomologacaoForm.svelte
Admin-only form for:
1.  **Contabilidade Review** (Date and text area for opinion)
2.  **Homologação** (Select Approved/Rejected, Date)

### PDF Generation

#### [MODIFY] pdfGenerator.ts
Implement templates for:
1.  **Solicitação de Diária** (Anexo II)
2.  **Prestação de Contas** (Anexo III)
3.  **Parecer e Homologação** (Anexo IV)

## Verification Plan

### Automated Tests
- Run `npm test` (if configured) to ensure schema migrations work.
- Validate form submission logic with mock data.

### Manual Verification
- Generate a sample PDF and compare it side-by-side with the provided image.
- Verify that the "Total" calculation in the form matches the sum of individual fields.
