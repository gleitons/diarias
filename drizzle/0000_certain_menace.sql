CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `accountability_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`daily_request_id` integer NOT NULL,
	`quantidade_pernoites` integer NOT NULL,
	`data_hora_partida` integer NOT NULL,
	`data_hora_chegada` integer NOT NULL,
	`relatorio_detalhado` text NOT NULL,
	`inexistencia_residencia_propria` integer DEFAULT true,
	`anexo_passagens` integer DEFAULT false,
	`anexo_cartoes_embarque` integer DEFAULT false,
	`anexo_autorizacao_veiculo` integer DEFAULT false,
	`anexo_comprovante_participacao` integer DEFAULT false,
	`data_relatorio` integer NOT NULL,
	`status` text NOT NULL,
	`contabilidade_data` integer,
	`contabilidade_parecer` text,
	`homologacao_status` text,
	`homologacao_data` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`daily_request_id`) REFERENCES `daily_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `daily_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`exercicio` integer NOT NULL,
	`data_solicitacao` integer NOT NULL,
	`quantidade_diarias` real NOT NULL,
	`tipo_diaria` text NOT NULL,
	`data_saida` integer NOT NULL,
	`data_retorno` integer NOT NULL,
	`meio_transporte` text NOT NULL,
	`veiculo_oficial_placa` text,
	`destino_cidade_uf` text NOT NULL,
	`veiculo_particular` integer DEFAULT false,
	`justificativa_veiculo_particular` text,
	`distancia_ida_volta` real,
	`valor_indenizacao_km` real DEFAULT 0.8,
	`dados_veiculo_proprio` text,
	`objetivo_viagem` text NOT NULL,
	`valor_diarias_solicitado` real NOT NULL,
	`valor_diarias_aprovado` real,
	`valor_passagem_solicitado` real DEFAULT 0,
	`valor_passagem_aprovado` real DEFAULT 0,
	`valor_indenizacao_transporte_solicitado` real DEFAULT 0,
	`valor_indenizacao_transporte_aprovado` real DEFAULT 0,
	`valor_total_solicitado` real NOT NULL,
	`valor_total_aprovado` real,
	`status` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prefeitura_nome` text NOT NULL,
	`prefeitura_endereco` text,
	`prefeitura_cep` text,
	`prefeitura_lei` text DEFAULT 'Lei No. 766/2017 (Decreto no. 32/2019)',
	`logo_url` text
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`role` text NOT NULL,
	`matricula` text,
	`unidade_administrativa` text,
	`cpf` text,
	`cargo` text,
	`banco_nome` text,
	`banco_agencia_cod` text,
	`banco_agencia_num` text,
	`banco_conta_num` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
