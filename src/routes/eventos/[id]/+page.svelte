<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, Save, MapPin, Hash, Trash2, CheckCircle2, Search, Loader2 } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();
	let isSaving = $state(false);
	let isDeleting = $state(false);

	let name = $state(data.event.name);
	let selectedState = $state(data.event.state);
	let selectedCity = $state(data.event.city);
	let distance = $state(data.event.distance || 0);
	let description = $state(data.event.description || '');

	let isSearchingDistance = $state(false);

	async function lookupDistance() {
		if (!selectedCity) return;
		isSearchingDistance = true;
		try {
			const res = await fetch(`/api/distancia?destino=${encodeURIComponent(selectedCity)}&uf=${encodeURIComponent(selectedState)}`);
			const json = await res.json();
			if (json.distance) {
				distance = json.distance;
			}
		} catch (e) {
			console.error('Erro ao buscar distância:', e);
		} finally {
			isSearchingDistance = false;
		}
	}

	const states = [
		{ id: 'MG', name: 'Minas Gerais' },
		{ id: 'DF', name: 'Distrito Federal' },
		{ id: 'SP', name: 'São Paulo' },
		{ id: 'RJ', name: 'Rio de Janeiro' },
		{ id: 'ES', name: 'Espírito Santo' },
		{ id: 'GO', name: 'Goiás' },
		{ id: 'BA', name: 'Bahia' }
	];
</script>

<div class="max-w-4xl mx-auto space-y-8 pb-12">
	<header class="flex items-center justify-between">
		<a href="/eventos" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
			<ArrowLeft size={20} />
			Voltar para Lista
		</a>
		<div class="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-black tracking-widest uppercase">
			<Hash size={14} />
			Código: {data.event.code}
		</div>
	</header>

	{#if form?.success}
		<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
			<div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
				<CheckCircle2 size={24} />
			</div>
			<div>
				<p class="font-bold">Evento atualizado!</p>
				<p class="text-sm">As informações foram salvas com sucesso.</p>
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<div class="lg:col-span-2 space-y-8">
			<form 
				id="update-form"
				method="POST" 
				action="?/update" 
				use:enhance={() => {
					isSaving = true;
					return async ({ update }) => {
						isSaving = false;
						await update();
					};
				}}
				class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
			>
				<div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
							<MapPin size={20} />
						</div>
						<h3 class="text-xl font-black text-slate-800">Editar Detalhes</h3>
					</div>
				</div>

				<div class="p-8 space-y-6">
					<div class="space-y-2">
						<label for="name" class="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Evento / Missão</label>
						<input 
							type="text" id="name" name="name" 
							required
							bind:value={name}
							placeholder="Ex: Congresso de Secretários de Saúde"
							class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
						/>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="state" class="text-xs font-black text-slate-400 uppercase tracking-widest">Estado (UF)</label>
							<select 
								id="state" name="state" 
								bind:value={selectedState}
								class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
							>
								{#each states as state}
									<option value={state.id}>{state.name}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-2">
							<label for="city" class="text-xs font-black text-slate-400 uppercase tracking-widest">Cidade</label>
							<div class="relative">
								<input 
									type="text" id="city" name="city" 
									required
									bind:value={selectedCity}
									onblur={lookupDistance}
									placeholder="Ex: Belo Horizonte"
									class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
								/>
								<button 
									type="button"
									onclick={lookupDistance}
									class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
									title="Recalcular distância"
								>
									<Search size={18} />
								</button>
							</div>
						</div>
					</div>

					<div class="space-y-2">
						<label for="description" class="text-xs font-black text-slate-400 uppercase tracking-widest">Descrição (Opcional)</label>
						<textarea 
							id="description" name="description" 
							bind:value={description}
							rows="3"
							placeholder="Detalhes adicionais sobre o objetivo comum deste evento..."
							class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-600 resize-none"
						></textarea>
					</div>

					<div class="pt-6 flex gap-4">
						<button 
							type="submit" 
							disabled={isSaving}
							class="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 disabled:opacity-50"
						>
							{#if isSaving}
								<Loader2 size={20} class="animate-spin" />
								Salvando...
							{:else}
								<Save size={20} />
								Salvar Alterações
							{/if}
						</button>
					</div>
				</div>
			</form>

			<!-- Danger Zone -->
			<section class="p-8 bg-red-50 rounded-3xl border border-red-100 flex items-center justify-between">
				<div>
					<p class="font-bold text-red-800">Zona de Perigo</p>
					<p class="text-sm text-red-600">Ao excluir este evento, o código de 6 dígitos deixará de funcionar.</p>
				</div>
				<form 
					method="POST" 
					action="?/delete"
					use:enhance={() => {
						if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) return;
						isDeleting = true;
						return async ({ update }) => {
							isDeleting = false;
							await update();
						};
					}}
				>
					<button 
						type="submit" 
						disabled={isDeleting}
						class="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
					>
						<Trash2 size={18} />
						{#if isDeleting}Excluindo...{:else}Excluir Evento{/if}
					</button>
				</form>
			</section>
		</div>

		<div class="space-y-6">
			<!-- Visualizador de Distância -->
			<div class="bg-slate-900 rounded-3xl p-8 text-white text-center space-y-6 sticky top-8">
				<div class="space-y-1">
					<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Distância do Evento</p>
					<div class="relative flex items-center justify-center gap-2">
						{#if isSearchingDistance}
							<div class="h-12 flex items-center justify-center">
								<Loader2 size={32} class="animate-spin text-blue-500" />
							</div>
						{:else}
							<input 
								type="number" 
								form="update-form"
								name="distance" 
								bind:value={distance}
								class="w-24 text-center text-4xl font-black bg-transparent border-b-2 border-slate-700 focus:border-blue-500 outline-none font-mono"
							/>
							<span class="text-lg text-slate-400 font-bold">KM</span>
						{/if}
					</div>
					<p class="text-[10px] text-slate-500 italic">Distância aproximada (ida). Ajuste se necessário.</p>
				</div>

				<div class="pt-6 border-t border-white/5 space-y-4">
					<div class="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
						<p class="text-xs font-bold text-amber-400 uppercase flex items-center justify-center gap-2">
							<Search size={14} />
							Código Permanente
						</p>
						<p class="text-2xl font-black tracking-[0.2em] font-mono text-white">
							{data.event.code}
						</p>
						<p class="text-[10px] text-slate-500 leading-relaxed">
							Este código nunca muda. Compartilhe-o com os servidores para que eles carreguem estas informações instantaneamente.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
