<script lang="ts">
	import { enhance } from '$app/forms';
	import { Building2, MapPin, Scale, Image, Calculator, Save, CheckCircle2, User, Plus, Trash2 } from 'lucide-svelte';

	let { data, form } = $props();
	let isSaving = $state(false);
	let isSavingSecretaria = $state(false);
	let showNovaSecretaria = $state(false);
	let isDeletingSecretaria = $state<number | null>(null);
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

	<!-- Secretarias e Órgãos -->
	<section class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
		<div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
			<div class="flex items-center gap-3">
				<Building2 class="text-blue-600" size={24} />
				<div>
					<h3 class="text-xl font-black text-slate-800">Secretarias e Órgãos</h3>
					<p class="text-sm text-slate-500 mt-1">Gerencie as secretarias disponíveis para cadastro dos servidores.</p>
				</div>
			</div>
			<button 
				type="button"
				onclick={() => showNovaSecretaria = !showNovaSecretaria}
				class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
			>
				<Plus size={18} /> Nova Secretaria
			</button>
		</div>

		{#if showNovaSecretaria}
			<div class="p-8 border-b border-slate-100 bg-slate-50">
				<form 
					method="POST" 
					action="?/createSecretaria"
					use:enhance={() => {
						isSavingSecretaria = true;
						return async ({ update }) => {
							isSavingSecretaria = false;
							showNovaSecretaria = false;
							await update();
						};
					}}
					class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
				>
					<h4 class="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
						<Plus size={18} class="text-blue-600" /> Cadastrar Nova Secretaria
					</h4>
					
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div class="space-y-2">
							<label for="nomeSec" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome da Secretaria</label>
							<input type="text" id="nomeSec" name="nome" required placeholder="Ex: Secretaria de Saúde" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
						</div>
						<div class="space-y-2">
							<label for="respSec" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Responsável (Secretário)</label>
							<input type="text" id="respSec" name="responsavel" required placeholder="Nome do responsável" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
						</div>
						<div class="space-y-2">
							<label for="matSec" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Matrícula</label>
							<input type="text" id="matSec" name="matricula" required placeholder="12345" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
						</div>
						<div class="space-y-2">
							<label for="endSec" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço do Prédio</label>
							<input type="text" id="endSec" name="endereco" required placeholder="Rua..." class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
						</div>
						<div class="space-y-2">
							<label for="cpfSec" class="text-xs font-bold text-slate-400 uppercase tracking-wider">CPF do Responsável</label>
							<input type="text" id="cpfSec" name="cpf" required placeholder="000.000.000-00" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
						</div>
						<div class="space-y-2">
							<label for="telSec" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone do Responsável</label>
							<input type="text" id="telSec" name="telefone" required placeholder="(00) 00000-0000" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
						</div>
						<div class="space-y-2 lg:col-span-3">
							<label for="compSec" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Competência</label>
							<textarea id="compSec" name="competencia" required placeholder="Descreva as competências desta secretaria..." rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"></textarea>
						</div>
					</div>

					<div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
						<button type="button" onclick={() => showNovaSecretaria = false} class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
						<button type="submit" disabled={isSavingSecretaria} class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2">
							{#if isSavingSecretaria}
								<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							{/if}
							Salvar Secretaria
						</button>
					</div>
				</form>
			</div>
		{/if}

		<div class="p-8">
			{#if !data.secretarias || data.secretarias.length === 0}
				<div class="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
					<Building2 class="mx-auto h-12 w-12 text-slate-300 mb-4" />
					<h3 class="text-sm font-medium text-slate-900">Nenhuma secretaria cadastrada</h3>
					<p class="mt-1 text-sm text-slate-500">Comece cadastrando as secretarias do município para que os servidores possam selecioná-las.</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm whitespace-nowrap">
						<thead>
							<tr class="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
								<th class="pb-3 font-medium">Nome</th>
								<th class="pb-3 font-medium">Responsável</th>
								<th class="pb-3 font-medium">Telefone</th>
								<th class="pb-3 font-medium text-right">Ações</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each data.secretarias as sec}
								<tr class="group hover:bg-slate-50/50 transition-colors">
									<td class="py-4 font-medium text-slate-800">{sec.nome}</td>
									<td class="py-4 text-slate-600">{sec.responsavel}</td>
									<td class="py-4 text-slate-600">{sec.telefone}</td>
									<td class="py-4 text-right">
										<form 
											method="POST" 
											action="?/deleteSecretaria"
											use:enhance={() => {
												isDeletingSecretaria = sec.id;
												return async ({ update }) => {
													isDeletingSecretaria = null;
													await update();
												};
											}}
											class="inline-block"
										>
											<input type="hidden" name="id" value={sec.id} />
											<button 
												type="submit" 
												disabled={isDeletingSecretaria === sec.id}
												class="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
												title="Remover secretaria"
												onclick={(e) => {
													if(!confirm('Tem certeza que deseja remover esta secretaria?')) e.preventDefault();
												}}
											>
												{#if isDeletingSecretaria === sec.id}
													<div class="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
												{:else}
													<Trash2 size={16} />
												{/if}
											</button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</section>
</div>
