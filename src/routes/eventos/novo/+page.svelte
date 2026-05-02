<script lang="ts">
	import { enhance } from '$app/forms';
	import { MapPin, Calendar, Info, Send, CheckCircle2, Search, Calculator, Loader2 } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { form } = $props();
	
	let isSaving = $state(false);
	let selectedState = $state('');
	let cities = $state<{id: string, nome: string}[]>([]);
	let selectedCity = $state('');
	let distance = $state(0);
	let isFetchingCities = $state(false);
	let isFetchingDistance = $state(false);

	const states = [
		{ id: '1', sigla: 'AC' }, { id: '2', sigla: 'AL' }, { id: '3', sigla: 'AP' }, { id: '4', sigla: 'AM' },
		{ id: '5', sigla: 'BA' }, { id: '6', sigla: 'CE' }, { id: '7', sigla: 'DF' }, { id: '8', sigla: 'ES' },
		{ id: '9', sigla: 'GO' }, { id: '10', sigla: 'MA' }, { id: '11', sigla: 'MT' }, { id: '12', sigla: 'MS' },
		{ id: '13', sigla: 'MG' }, { id: '14', sigla: 'PA' }, { id: '15', sigla: 'PB' }, { id: '16', sigla: 'PR' },
		{ id: '17', sigla: 'PE' }, { id: '18', sigla: 'PI' }, { id: '19', sigla: 'RJ' }, { id: '20', sigla: 'RN' },
		{ id: '21', sigla: 'RS' }, { id: '22', sigla: 'RO' }, { id: '23', sigla: 'RR' }, { id: '24', sigla: 'SC' },
		{ id: '25', sigla: 'SP' }, { id: '26', sigla: 'SE' }, { id: '27', sigla: 'TO' }
	];

	async function fetchCities() {
		if (!selectedState) return;
		isFetchingCities = true;
		try {
			const res = await fetch(`/api/cidades?estado=${selectedState}`);
			const data = await res.json();
			// The API returns [{"id": "Nome"}, ...]
			cities = data.map((obj: any) => Object.values(obj)[0]);
		} catch (e) {
			console.error(e);
		} finally {
			isFetchingCities = false;
		}
	}

	async function fetchDistance() {
		if (!selectedCity) return;
		isFetchingDistance = true;
		try {
			const res = await fetch(`/api/distancia?destino=${selectedCity}`);
			const data = await res.json();
			if (data.distance) {
				distance = data.distance;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isFetchingDistance = false;
		}
	}
</script>

<div class="space-y-6 pb-12">
	<header>
		<h2 class="text-2xl font-bold text-slate-800">Cadastrar Evento</h2>
		<p class="text-slate-500">Crie um evento compartilhado com cálculo de distância automático.</p>
	</header>

	{#if form?.success}
		<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl animate-in fade-in slide-in-from-top-4">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
					<CheckCircle2 size={24} />
				</div>
				<div>
					<p class="font-bold text-lg">Evento criado com sucesso!</p>
					<p class="text-sm">Código de acesso: <span class="bg-emerald-200 px-2 py-1 rounded font-black text-emerald-900 tracking-widest">{form.code}</span></p>
				</div>
			</div>
		</div>
	{/if}

	<form 
		method="POST" 
		action="?/create" 
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
			<!-- Dados do Evento -->
			<section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
				<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
					<Info class="text-blue-600" size={20} />
					<h3 class="font-bold text-slate-800">Informações Gerais</h3>
				</div>
				<div class="p-6 space-y-6">
					<div class="space-y-2">
						<label for="name" class="text-sm font-semibold text-slate-700">Nome do Evento</label>
						<input 
							type="text" id="name" name="name" 
							required
							placeholder="Ex: Congresso de Gestão Pública"
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						/>
					</div>
					<div class="space-y-2">
						<label for="description" class="text-sm font-semibold text-slate-700">Descrição / Pauta</label>
						<textarea 
							id="description" name="description" 
							rows="4"
							placeholder="O que será discutido neste evento?"
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
						></textarea>
					</div>
				</div>
			</section>

			<!-- Localização -->
			<section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
				<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
					<MapPin class="text-blue-600" size={20} />
					<h3 class="font-bold text-slate-800">Localização</h3>
				</div>
				<div class="p-6 space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="state" class="text-sm font-semibold text-slate-700">Estado (UF)</label>
							<select 
								id="state" name="state" 
								bind:value={selectedState}
								onchange={fetchCities}
								required
								class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
							>
								<option value="">Selecione o estado</option>
								{#each states as state}
									<option value={state.sigla}>{state.sigla}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<label for="city" class="text-sm font-semibold text-slate-700">Cidade</label>
							<div class="relative">
								<select 
									id="city" name="city" 
									bind:value={selectedCity}
									onchange={fetchDistance}
									required
									disabled={isFetchingCities || cities.length === 0}
									class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
								>
									<option value="">Selecione a cidade</option>
									{#each cities as city}
										<option value={city}>{city}</option>
									{/each}
								</select>
								{#if isFetchingCities}
									<div class="absolute right-4 top-1/2 -translate-y-1/2">
										<Loader2 class="animate-spin text-blue-600" size={18} />
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>

		<!-- Distância e Finalização -->
		<div class="space-y-6">
			<section class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden sticky top-8">
				<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-blue-600 text-white">
					<Calculator size={20} />
					<h3 class="font-bold">Distância (KM)</h3>
				</div>
				<div class="p-6 space-y-6">
					<div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
						{#if isFetchingDistance}
							<div class="flex flex-col items-center gap-2 py-4">
								<Loader2 class="animate-spin text-blue-600" size={32} />
								<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculando...</p>
							</div>
						{:else}
							<p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">De Lagoa dos Patos a {selectedCity || '...'}</p>
							<div class="relative flex items-center justify-center gap-2">
								<input 
									type="number" 
									name="distance" 
									bind:value={distance}
									class="w-24 text-center text-4xl font-black bg-transparent border-b-2 border-slate-200 focus:border-blue-500 outline-none font-mono"
								/>
								<span class="text-lg text-slate-400 font-bold">KM</span>
							</div>
							<p class="text-xs text-slate-500 italic">Distância aproximada (ida). Você pode ajustar manualmente se necessário.</p>
						{/if}
					</div>

					<div class="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
						<p class="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
							<Search size={14} />
							Público e Compartilhável
						</p>
						<p class="text-[10px] text-blue-600 leading-relaxed">
							Um código de 6 dígitos será gerado. Qualquer pessoa com o código poderá carregar estas informações.
						</p>
					</div>

					<button 
						type="submit" 
						disabled={isSaving || isFetchingDistance || !selectedCity}
						class="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 shadow-lg shadow-blue-200 mt-4"
					>
						{#if isSaving}
							<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Criando...
						{:else}
							<Send size={20} />
							Cadastrar Evento
						{/if}
					</button>
				</div>
			</section>
		</div>
	</form>
</div>
