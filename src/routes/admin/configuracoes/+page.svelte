<script lang="ts">
	import { enhance } from '$app/forms';
	import { Building2, MapPin, Scale, Image, Calculator, Save, CheckCircle2, User } from 'lucide-svelte';

	let { data, form } = $props();
	let isSaving = $state(false);
</script>

<div class="space-y-8 pb-12">
	<header>
		<h2 class="text-3xl font-black text-slate-800">Configurações Gerais</h2>
		<p class="text-slate-500">Ajuste os dados da prefeitura, identidade visual e parâmetros do sistema.</p>
	</header>

	{#if form?.success}
		<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
			<div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
				<CheckCircle2 size={24} />
			</div>
			<div>
				<p class="font-bold">Configurações salvas!</p>
				<p class="text-sm">As alterações foram aplicadas em todo o sistema.</p>
			</div>
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
			};
		}}
		class="grid grid-cols-1 lg:grid-cols-3 gap-8"
	>
		<div class="lg:col-span-2 space-y-8">
			<!-- Dados da Instituição -->
			<section class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
				<div class="p-8 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
					<Building2 class="text-blue-600" size={24} />
					<h3 class="text-xl font-black text-slate-800">Dados da Instituição</h3>
				</div>
				<div class="p-8 space-y-6">
					<div class="space-y-2">
						<label for="prefeituraNome" class="text-xs font-black text-slate-400 uppercase tracking-widest">Nome da Prefeitura / Órgão</label>
						<input 
							type="text" id="prefeituraNome" name="prefeituraNome" 
							required
							value={data.config?.prefeituraNome ?? ''}
							placeholder="Prefeitura Municipal de..."
							class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
						/>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="prefeituraEndereco" class="text-xs font-black text-slate-400 uppercase tracking-widest">Endereço Completo</label>
							<div class="relative">
								<MapPin class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
								<input 
									type="text" id="prefeituraEndereco" name="prefeituraEndereco" 
									value={data.config?.prefeituraEndereco ?? ''}
									class="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<label for="prefeituraCep" class="text-xs font-black text-slate-400 uppercase tracking-widest">CEP</label>
							<input 
								type="text" id="prefeituraCep" name="prefeituraCep" 
								value={data.config?.prefeituraCep ?? ''}
								placeholder="00000-000"
								class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="prefeituraLei" class="text-xs font-black text-slate-400 uppercase tracking-widest">Legislação de Referência</label>
							<div class="relative">
								<Scale class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
								<input 
									type="text" id="prefeituraLei" name="prefeituraLei" 
									value={data.config?.prefeituraLei ?? ''}
									placeholder="Lei No. 766/2017..."
									class="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<label for="prefeitoNome" class="text-xs font-black text-slate-400 uppercase tracking-widest">Prefeito(a) Municipal (Assinatura)</label>
							<div class="relative">
								<User class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
								<input 
									type="text" id="prefeitoNome" name="prefeitoNome" 
									value={data.config?.prefeitoNome ?? ''}
									placeholder="Nome do Prefeito"
									class="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-slate-700"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Identidade Visual -->
			<section class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
				<div class="p-8 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
					<Image class="text-blue-600" size={24} />
					<h3 class="text-xl font-black text-slate-800">Identidade Visual</h3>
				</div>
				<div class="p-8 space-y-6">
					<div class="space-y-2">
						<label for="logoUrl" class="text-xs font-black text-slate-400 uppercase tracking-widest">URL do Brasão / Logo</label>
						<input 
							type="text" id="logoUrl" name="logoUrl" 
							value={data.config?.logoUrl ?? ''}
							placeholder="https://..."
							class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
						/>
					</div>
					{#if data.config?.logoUrl}
						<div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-6">
							<img src={data.config.logoUrl} alt="Logo Preview" class="h-20 object-contain bg-white p-2 rounded-lg border border-slate-200 shadow-sm" />
							<div>
								<p class="text-sm font-bold text-slate-700">Preview do Brasão</p>
								<p class="text-xs text-slate-500">Este brasão aparecerá no cabeçalho de todos os PDFs gerados pelo sistema.</p>
							</div>
						</div>
					{/if}
				</div>
			</section>
		</div>

		<!-- Parâmetros de Cálculo -->
		<div class="space-y-6">
			<section class="bg-slate-900 rounded-3xl shadow-xl p-8 text-white space-y-8 sticky top-8">
				<div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
					<Calculator size={20} />
					Parâmetros Globais
				</div>

				<div class="space-y-6">
					<div class="space-y-2">
						<label for="valorIndenizacaoKm" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Indenização (R$ / KM)</label>
						<div class="relative">
							<span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">R$</span>
							<input 
								type="number" id="valorIndenizacaoKm" name="valorIndenizacaoKm" step="0.01" required
								value={data.config?.valorIndenizacaoKm ?? 0.8}
								class="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-2xl font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
							/>
						</div>
						<p class="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold pt-2">
							Este valor é utilizado quando o servidor utiliza veículo próprio para a viagem.
						</p>
					</div>
				</div>

				<button 
					type="submit" 
					disabled={isSaving}
					class="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
				>
					{#if isSaving}
						<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						Salvando...
					{:else}
						<Save size={20} />
						Salvar Configurações
					{/if}
				</button>
			</section>
		</div>
	</form>
</div>
