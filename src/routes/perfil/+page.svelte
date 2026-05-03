<script lang="ts">
	import { enhance } from '$app/forms';
	import { User, Briefcase, Landmark, Save, CheckCircle2 } from 'lucide-svelte';
	import { formatCpf, formatPhone } from '$lib/functions/all';

	let { data, form } = $props();
	let isSaving = $state(false);

	let unidadeLength = $state(data.user?.unidadeAdministrativa?.length || 0);

	function handleCpfInput(e: Event) {
		const target = e.target as HTMLInputElement;
		target.value = formatCpf(target.value);
	}

	function handleTelefoneInput(e: Event) {
		const target = e.target as HTMLInputElement;
		target.value = formatPhone(target.value);
	}
	function dadosBancarios(e: Event) {
		const target = e.target as HTMLInputElement;
		target.value = target.value.toUpperCase();
	}
	function unidadeAdministrativa(e: Event) {
		const target = e.target as HTMLInputElement;
		target.value = target.value.toUpperCase();
		unidadeLength = target.value.length;
	}
	let cargoLength = $state(data.user?.cargo?.length || 0);
	function cargo(e: Event) {
		const target = e.target as HTMLInputElement;
		target.value = target.value.toUpperCase();
		cargoLength = target.value.length;
	}
	let nomeLength = $state(data.user?.name?.length || 0);
	function nomeCompleto(e: Event) {
		const target = e.target as HTMLInputElement;
		target.value = target.value.toUpperCase();
		nomeLength = target.value.length;
	}
</script>

<div class="space-y-6">
	<header>
		<h2 class="text-2xl font-bold text-slate-800">Meu Perfil</h2>
		<p class="text-slate-500">
			Mantenha seus dados atualizados para agilizar suas solicitações de diária.
		</p>
	</header>

	{#if form?.success}
		<div
			class="animate-in fade-in slide-in-from-top-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700"
		>
			<CheckCircle2 size={20} />
			<span class="font-medium">Perfil atualizado com sucesso!</span>
		</div>
	{/if}

	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			isSaving = true;
			return async ({ update }) => {
				isSaving = false;
				await update();
				window.location.href = '/';
			};
		}}
		class="space-y-6"
	>
		<!-- Informações Profissionais -->
		<section class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
			<div class="flex items-center gap-3 border-b border-slate-50 bg-slate-50/50 p-6">
				<Briefcase class="text-blue-600" size={20} />
				<h3 class="font-bold text-slate-800">Dados Profissionais</h3>
			</div>
			<div class="grid-cols- grid gap-6 p-6 md:grid-cols-3">
				<div class="space-y-2">
					<label for="nomeCompleto" class="text-sm font-semibold text-slate-700"
						>Nome Completo</label
					>
					<input
						type="text"
						id="name"
						name="name"
						value={data.user?.name ?? ''}
						placeholder="Ex: 1749"
						oninput={nomeCompleto}
						maxlength={45}
						class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
					<p class="text-xs text-slate-500">{45 - nomeLength} caracteres restantes</p>
				</div>
				<div class="space-y-2">
					<label for="matricula" class="text-sm font-semibold text-slate-700">Matrícula</label>
					<input
						type="text"
						id="matricula"
						name="matricula"
						value={data.user?.matricula ?? ''}
						placeholder="Ex: 1749"
						class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div class="space-y-2">
					<label for="cpf" class="text-sm font-semibold text-slate-700">CPF</label>
					<input
						type="text"
						id="cpf"
						name="cpf"
						value={data.user?.cpf ?? ''}
						placeholder="000.000.000-00"
						oninput={handleCpfInput}
						class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div class="space-y-2">
						<label for="cargo" class="text-sm font-bold text-slate-700">Cargo Municipal</label>
						<input
							id="cargo"
							name="cargo"
							type="text"
							value={data.user?.cargo || ''}
							required
							oninput={cargo}
							maxlength={50}
							class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<p class="text-xs text-slate-500">{50 - cargoLength} caracteres restantes</p>
					</div>
				<div class="space-y-2">
					<label for="secretariaOrgao" class="text-sm font-semibold text-slate-700"
						>Secretaria / Órgão</label
					>
					<!-- <input
							type="text"
							id="secretariaOrgao"
							name="secretariaOrgao"
							value={data.user?.secretariaOrgao ?? ''}
							placeholder="Ex: Secretaria de Saúde"
							class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							required
						/> -->
					<select
						name="secretariaOrgao"
						id="secretariaOrgao"
						class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Selecione</option>
						<option value="ADMINISTRAÇÃO">ADMINISTRAÇÃO</option>
						<option value="CONTABILIDADE">CONTABILIDADE</option>
						<option value="DEPARTAMENTO PESSOAL">DEPARTAMENTO PESSOAL</option>
						<option value="PROCURADORIA">PROCURADORIA</option>
						<option value="ASSISTÊNCIA SOCIAL">ASSISTÊNCIA SOCIAL</option>
						<option value="EDUCAÇÃO">EDUCAÇÃO</option>
						<option value="FINANÇAS">FINANÇAS</option>
						<option value="AGRICULTURA">AGRICULTURA</option>
						<option value="GABINETE">GABINETE</option>
						<option value="MEIO AMBIENTE">MEIO AMBIENTE</option>
						<option value="SAÚDE">SAÚDE</option>
						<option value="SEGURANÇA PÚBLICA">SEGURANÇA PÚBLICA</option>
						<option value="TURISMO">TURISMO</option>
						<option value="OBRAS E TRANSPORTES">OBRAS E TRANSPORTES</option>
						<option value="CULTURA E ESPORTE">CULTURA E ESPORTE</option>
					</select>
				</div>


				<!-- <div class="grid grid-cols-1 gap-6 md:grid-cols-2"> -->
					

					<div class="space-y-2">
						<label for="phone" class="text-sm font-bold text-slate-700">Telefone / WhatsApp</label>
						<input
							id="phone"
							name="phone"
							type="text"
							value={data.user?.phone || ''}
							oninput={handleTelefoneInput}
							required
							placeholder="(00) 00000-0000"
							class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				<!-- </div> -->

				<div class="space-y-2">
					<label for="unidadeAdministrativa" class="text-sm font-semibold text-slate-700"
						>Unidade Administrativa</label
					>
					<input
						type="text"
						id="unidadeAdministrativa"
						name="unidadeAdministrativa"
						value={data.user?.unidadeAdministrativa ?? ''}
						placeholder="Ex: Tributário"
						oninput={unidadeAdministrativa}
						class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						maxlength={30}
					/>
					<p class="text-xs text-slate-500">{30 - unidadeLength} caracteres restantes</p>
				</div>
			</div>
		</section>

		<!-- Dados Bancários -->
		<section class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
			<div class="flex items-center gap-3 border-b border-slate-50 bg-slate-50/50 p-6">
				<Landmark class="text-blue-600" size={20} />
				<h3 class="font-bold text-slate-800">Dados Bancários</h3>
			</div>
			<div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
				<div class="space-y-2">
					<label for="bancoNome" class="text-sm font-semibold text-slate-700">Nome do Banco</label>
					<input
						type="text"
						id="bancoNome"
						name="bancoNome"
						value={data.user?.bancoNome ?? ''}
						oninput={dadosBancarios}
						placeholder="Ex: Sicoob"
						class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="bancoAgenciaCod" class="text-sm font-semibold text-slate-700"
							>Cód. Agência</label
						>
						<input
							type="text"
							id="bancoAgenciaCod"
							name="bancoAgenciaCod"
							value={data.user?.bancoAgenciaCod ?? ''}
							class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div class="space-y-2">
						<label for="bancoAgenciaNum" class="text-sm font-semibold text-slate-700"
							>Nº Agência</label
						>
						<input
							type="text"
							id="bancoAgenciaNum"
							name="bancoAgenciaNum"
							value={data.user?.bancoAgenciaNum ?? ''}
							class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<label for="bancoContaNum" class="text-sm font-semibold text-slate-700"
							>Nº da Conta</label
						>
						<input
							type="text"
							id="bancoContaNum"
							name="bancoContaNum"
							value={data.user?.bancoContaNum ?? ''}
							class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div class="space-y-2">
						<label for="bancoTipoConta" class="text-sm font-semibold text-slate-700"
							>Tipo de Conta</label
						>
						<select
							id="bancoTipoConta"
							name="bancoTipoConta"
							class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						>
							<option value="Corrente" selected={data.user?.bancoTipoConta === 'Corrente'}
								>Conta Corrente</option
							>
							<option value="Poupança" selected={data.user?.bancoTipoConta === 'Poupança'}
								>Conta Poupança</option
							>
						</select>
					</div>
				</div>
			</div>
		</section>

		<div class="flex justify-end pt-4">
			<button
				type="submit"
				disabled={isSaving}
				class="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
			>
				{#if isSaving}
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
					></div>
					Salvando...
				{:else}
					<Save size={20} />
					Salvar Alterações
				{/if}
			</button>
		</div>
	</form>
</div>
