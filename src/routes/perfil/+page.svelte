<script lang="ts">
	import { enhance } from '$app/forms';
	import { User, Briefcase, Landmark, Save, CheckCircle2 } from 'lucide-svelte';

	let { data, form } = $props();
	let isSaving = $state(false);
</script>

<div class="space-y-6">
	<header>
		<h2 class="text-2xl font-bold text-slate-800">Meu Perfil</h2>
		<p class="text-slate-500">Mantenha seus dados atualizados para agilizar suas solicitações de diária.</p>
	</header>

	{#if form?.success}
		<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
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
				window.location.href = '/'
			};
		}}
		class="space-y-6"
	>
		<!-- Informações Profissionais -->
		<section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
			<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
				<Briefcase class="text-blue-600" size={20} />
				<h3 class="font-bold text-slate-800">Dados Profissionais</h3>
			</div>
			<div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-2">
					<label for="matricula" class="text-sm font-semibold text-slate-700">Matrícula</label>
					<input 
						type="text" id="matricula" name="matricula" 
						value={data.user?.matricula ?? ''}
						placeholder="Ex: 1749"
						class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
					/>
				</div>
				<div class="space-y-2">
					<label for="cpf" class="text-sm font-semibold text-slate-700">CPF</label>
					<input 
						type="text" id="cpf" name="cpf" 
						value={data.user?.cpf ?? ''}
						placeholder="000.000.000-00"
						class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
					/>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-2">
						<label for="cargo" class="text-sm font-bold text-slate-700">Cargo Municipal</label>
						<input id="cargo" name="cargo" type="text" value={data.user?.cargo || ''} required
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
					</div>
					<div class="space-y-2">
						<label for="phone" class="text-sm font-bold text-slate-700">Telefone / WhatsApp</label>
						<input id="phone" name="phone" type="text" value={data.user?.phone || ''} required placeholder="(00) 00000-0000"
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
					</div>
				</div>
				<div class="space-y-2">
					<label for="unidadeAdministrativa" class="text-sm font-semibold text-slate-700">Unidade Administrativa</label>
					<input 
						type="text" id="unidadeAdministrativa" name="unidadeAdministrativa" 
						value={data.user?.unidadeAdministrativa ?? ''}
						placeholder="Ex: Tributário"
						class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
					/>
				</div>
			</div>
		</section>

		<!-- Dados Bancários -->
		<section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
			<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
				<Landmark class="text-blue-600" size={20} />
				<h3 class="font-bold text-slate-800">Dados Bancários</h3>
			</div>
			<div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-2">
					<label for="bancoNome" class="text-sm font-semibold text-slate-700">Nome do Banco</label>
					<input 
						type="text" id="bancoNome" name="bancoNome" 
						value={data.user?.bancoNome ?? ''}
						placeholder="Ex: Sicoob"
						class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="bancoAgenciaCod" class="text-sm font-semibold text-slate-700">Cód. Agência</label>
						<input 
							type="text" id="bancoAgenciaCod" name="bancoAgenciaCod" 
							value={data.user?.bancoAgenciaCod ?? ''}
							class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
						/>
					</div>
					<div class="space-y-2">
						<label for="bancoAgenciaNum" class="text-sm font-semibold text-slate-700">Nº Agência</label>
						<input 
							type="text" id="bancoAgenciaNum" name="bancoAgenciaNum" 
							value={data.user?.bancoAgenciaNum ?? ''}
							class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
						/>
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="bancoContaNum" class="text-sm font-semibold text-slate-700">Nº da Conta</label>
						<input 
							type="text" id="bancoContaNum" name="bancoContaNum" 
							value={data.user?.bancoContaNum ?? ''}
							class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
						/>
					</div>
					<div class="space-y-2">
						<label for="bancoTipoConta" class="text-sm font-semibold text-slate-700">Tipo de Conta</label>
						<select 
							id="bancoTipoConta" name="bancoTipoConta" 
							class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
						>
							<option value="Corrente" selected={data.user?.bancoTipoConta === 'Corrente'}>Conta Corrente</option>
							<option value="Poupança" selected={data.user?.bancoTipoConta === 'Poupança'}>Conta Poupança</option>
						</select>
					</div>
				</div>
			</div>
		</section>

		<div class="flex justify-end pt-4">
			<button 
				type="submit" 
				disabled={isSaving}
				class="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
			>
				{#if isSaving}
					<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
					Salvando...
				{:else}
					<Save size={20} />
					Salvar Alterações
				{/if}
			</button>
		</div>
	</form>
</div>
