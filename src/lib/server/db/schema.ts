import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').unique().notNull(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	
	// App specific fields
	role: text('role').$default(() => 'solicitante').notNull(), // solicitante | adm_diarias | adm_geral
	matricula: text('matricula'),
	unidadeAdministrativa: text('unidade_administrativa'),
	cpf: text('cpf'),
	cargo: text('cargo'),
	bancoNome: text('banco_nome'),
	bancoAgenciaCod: text('banco_agencia_cod'),
	bancoAgenciaNum: text('banco_agencia_num'),
	bancoContaNum: text('banco_conta_num'),
	phone: text('phone'),
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const dailyRequests = sqliteTable('daily_requests', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	code: text('code').unique().notNull(),
	userId: text('user_id')
		.references(() => user.id)
		.notNull(),
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
	valorIndenizacaoKm: real('valor_indenizacao_km').default(0.8),
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

	status: text('status').$default(() => 'pendente').notNull(), // pendente | aprovada | rejeitada
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const accountabilityReports = sqliteTable('accountability_reports', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	dailyRequestId: integer('daily_request_id')
		.references(() => dailyRequests.id)
		.notNull(),

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
	status: text('status').$default(() => 'pendente').notNull(), // pendente | aprovada | rejeitada

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
	prefeituraLei: text('prefeitura_lei').default('Lei No. 766/2017 (Decreto no. 32/2019)'),
	logoUrl: text('logo_url'),
});

export const priceZones = sqliteTable('price_zones', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	maxDistance: real('max_distance').notNull(),
	price: real('price').notNull(),
});

export const events = sqliteTable('events', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	code: text('code').unique().notNull(),
	name: text('name').notNull(),
	state: text('state').notNull(),
	city: text('city').notNull(),
	distance: real('distance'),
	description: text('description'),
	userId: text('user_id')
		.references(() => user.id)
		.notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
