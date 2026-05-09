<script lang="ts">
	import { enhance } from '$app/forms';
	import { MapPin, Calendar, Truck, Target, Calculator, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();
	
	let isSaving = $state(false);
	let isSearchingDistance = $state(false);
	let distancia = $state(0);
	let quantidade = $state(1);
	let tipoTransporte = $state('Oficial');
	let veiculoParticular = $state(false);
	
	// Event loading
	let eventCode = $state('');
	let isLoadingEvent = $state(false);
	let eventError = $state('');

	let destinoCidadeUf = $state('');
	let objetivoViagem = $state('');

	async function loadEvent() {
		if (eventCode.length !== 6) return;
		isLoadingEvent = true;
		eventError = '';
		try {
			const res = await fetch(`/api/eventos/${eventCode}`);
			if (!res.ok) throw new Error('Evento não encontrado');
			const data = await res.json();
			
			destinoCidadeUf = `${data.city} - ${data.state}`;
			objetivoViagem = `${data.name}\n${data.description || ''}`;
			distancia = (data.distance || 0) * 2; // Ida e volta
		} catch (e: any) {
			eventError = e.message;
		} finally {
			isLoadingEvent = false;
		}
	}

	async function lookupDistance() {
		if (!destinoCidadeUf || destinoCidadeUf.length < 3) return;
		
		const parts = destinoCidadeUf.split(' - ');
		const city = parts[0];
		const uf = parts[1];
		
		const cached = data.destinations?.find(d => 
			d.city.toLowerCase() === city.trim().toLowerCase() && 
			(!uf || d.state.toLowerCase() === uf.trim().toLowerCase())
		);

		if (cached) {
			distancia = cached.distance * 2;
			return;
		}

		isSearchingDistance = true;
		try {
			const res = await fetch(`/api/distancia?destino=${encodeURIComponent(city.trim())}&uf=${encodeURIComponent(uf?.trim() || 'MG')}`);
			const json = await res.json();
			if (json.distance) {
				distancia = json.distance * 2;
			}
		} catch (e) {
			console.error('Erro ao buscar distância:', e);
		} finally {
			isSearchingDistance = false;
		}
	}

	// Derived calculations
	let valorUnitario = $derived.by(() => {
		if (!data.priceZones) return 0;
		const sorted = [...data.priceZones].sort((a, b) => a.maxDistance - b.maxDistance);
		const zone = sorted.find(z => (distancia / 2) <= z.maxDistance) || sorted[sorted.length - 1];
		return zone?.price || 0;
	});

	let valorTotal = $derived(valorUnitario * quantidade);
</script>

<div class="space-y-6 pb-12">
	<header class="flex justify-between items-start">
		<div id="topo">
			<h2 class="text-2xl font-bold text-slate-800">Solicitar Diária</h2>
			<p class="text-slate-500">Preencha os dados da sua viagem para solicitar a diária (Anexo II).</p>
		</div>
		
		<!-- Carregar Evento Quick Form -->
		
	</header>

	{#if form?.success}
		<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
			<div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
				<CheckCircle2 size={24} />
			</div>
			<div>
				<p class="font-bold">Solicitação enviada!</p>
				<p class="text-sm">Sua solicitação foi registrada e está aguardando aprovação.</p>
			</div>
		</div>
	{/if}

	<form 
		method="POST" 
		action="?/submit" 
		use:enhance={() => {
			isSaving = true;
			return async ({ update }) => {
				isSaving = false;
				await update();
				window.location.reload();
			};
		}}
		class="grid grid-cols-1 lg:grid-cols-3 gap-8"
	>
		<div class="lg:col-span-2 space-y-8">
			<!-- Destino e Objetivo -->
			<section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
				<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
					<MapPin class="text-blue-600" size={20} />
					<h3 class="font-bold text-slate-800">Destino e Objetivo</h3>
				</div>
				<div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
			<div class="space-y-1">
				<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tem um código de evento?</p>
				<div class="flex gap-2">
					<input 
						type="text" 
						bind:value={eventCode}
						placeholder="Ex: 215444"
						maxlength="6"
						class="w-36 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
					/>
					<button 
						type="button"
						onclick={loadEvent}
						disabled={isLoadingEvent || eventCode.length !== 6}
						class="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
					>
						{#if isLoadingEvent}
							<Loader2 size={14} class="animate-spin" />
						{:else}
							Carregar
						{/if}
					</button>
					<a href="/eventos" target="_blank" class="px-3 py-1.5 bg-green-900 text-white rounded-lg text-xs font-bold hover:bg-green-800 transition-colors disabled:opacity-50">Listar Eventos</a>
				</div>
				{#if eventError}
					<p class="text-[10px] text-red-500 font-bold">{eventError}</p>
				{/if}
			</div>
		</div>
				<div class="p-6 space-y-6">
					<div class="space-y-2">
						<label for="destinoCidadeUf" class="text-sm font-semibold text-slate-700">Cidade de Destino / UF</label>
						<!-- disabled={true} -->
						<input 
							type="text" id="destinoCidadeUf" name="destinoCidadeUf" 
							bind:value={destinoCidadeUf}
							list="destinations-list"
							onblur={lookupDistance}
							required
							placeholder="Insirao codigo do evento acima"
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						/>
						<datalist id="destinations-list">
							{#each data.destinations as d}
								<option value="{d.city} - {d.state}"></option>
							{/each}
						</datalist>
					</div>
					<div class="space-y-2">
						<label for="objetivoViagem" class="text-sm font-semibold text-slate-700">Objetivo da Viagem</label>
						<textarea 
							id="objetivoViagem" name="objetivoViagem" 
							bind:value={objetivoViagem}
							required
							rows="3"
							placeholder="Por favor Insira o codigo do evento..."
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
						></textarea>
					</div>
				</div>
			</section>

			<!-- Período e Transporte -->
			<section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
				<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
					<Calendar class="text-blue-600" size={20} />
					<h3 class="font-bold text-slate-800">Período e Transporte</h3>
				</div>
				<div class="p-6 space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="dataSolicitacao" class="text-sm font-semibold text-slate-700">Data da Solicitação</label>
							<input 
								type="date" id="dataSolicitacao" name="dataSolicitacao" 
								required
								value={new Date().toISOString().split('T')[0]}
								class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="dataSaida" class="text-sm font-semibold text-slate-700">Data de Saída</label>
							<div class="grid grid-cols-3 gap-2">
								<input 
									type="date" id="dataSaida" name="dataSaida" 
									required
									class="col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
								/>
								<input 
									type="time" id="horaSaida" name="horaSaida" 
									required
									class="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<label for="dataRetorno" class="text-sm font-semibold text-slate-700">Data de Retorno</label>
							<div class="grid grid-cols-3 gap-2">
								<input 
									type="date" id="dataRetorno" name="dataRetorno" 
									required
									class="col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
								/>
								<input 
									type="time" id="horaRetorno" name="horaRetorno" 
									required
									class="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
								/>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="meioTransporte" class="text-sm font-semibold text-slate-700">Meio de Transporte</label>
							<select 
								id="meioTransporte" name="meioTransporte" 
								bind:value={tipoTransporte}
								class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
							>
								<option value="Oficial">Veículo Oficial</option>
								<option value="Avião">Avião</option>
								<option value="Ônibus">Ônibus</option>
								<option value="Van">Van / Micro-ônibus</option>
								<option value="Outro">Outro</option>
							</select>
						</div>
						{#if tipoTransporte === 'Oficial'}
							<div class="space-y-2 animate-in fade-in zoom-in-95 duration-200">
								<label for="veiculoOficialPlaca" class="text-sm font-semibold text-slate-700">Placa do Veículo</label>
								<input 
									type="text" id="veiculoOficialPlaca" name="veiculoOficialPlaca" 
									placeholder="ABC-1234"
									class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center uppercase font-mono tracking-widest"
								/>
							</div>
						{/if}
					</div>

					<div class="pt-4 border-t border-slate-50 space-y-4">
						<label class="flex items-center gap-3 cursor-pointer group">
							<div class="relative flex items-center">
								<input type="checkbox" name="veiculoParticular" bind:checked={veiculoParticular} class="peer sr-only" />
								<div class="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
								<div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform shadow-sm"></div>
							</div>
							<span class="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Viagem em veículo particular</span>
						</label>

						{#if veiculoParticular}
							<div class="grid grid-cols-1 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
								<div class="space-y-2">
									<label for="dadosVeiculoProprio" class="text-sm font-semibold text-slate-700">Dados do Veículo (Marca, Modelo, Placa)</label>
									<input 
										type="text" id="dadosVeiculoProprio" name="dadosVeiculoProprio" required
										placeholder="Ex: Fiat Uno - ABC-1234"
										class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
									/>
								</div>
								<div class="space-y-2">
									<label for="justificativaVeiculoParticular" class="text-sm font-semibold text-slate-700">Justificativa do uso de veículo particular</label>
									<textarea 
										id="justificativaVeiculoParticular" name="justificativaVeiculoParticular" required
										rows="2"
										placeholder="Explique por que não está utilizando transporte oficial..."
										class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
									></textarea>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</section>
		</div>

		<!-- Resumo e Cálculo -->
		<div class="space-y-6">
			<section class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden sticky top-8">
				<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-blue-600 text-white">
					<Calculator size={20} />
					<h3 class="font-bold">Cálculo da Diária</h3>
				</div>
				<div class="p-6 space-y-6">
					<div class="space-y-4">
						<div class="space-y-2">
							<label for="distanciaIdaVolta" class="text-sm font-semibold text-slate-700">Distância Total (Ida e Volta - KM)</label>
							<div class="relative">
								<input 
									type="number" id="distanciaIdaVolta" name="distanciaIdaVolta" 
									bind:value={distancia}
									required min="0" step="any"
									class={cn(
										"w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-lg",
										isSearchingDistance && "animate-pulse bg-blue-50 border-blue-200"
									)}
								/>
								{#if isSearchingDistance}
									<p class="text-[10px] text-blue-600 font-bold animate-pulse uppercase tracking-widest mt-1">Buscando distância...</p>
								{/if}
								<span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">KM</span>
							</div>
							<p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">O valor unitário é baseado em {distancia / 2}km (Ida)</p>
						</div>

						<div class="space-y-2">
							<label for="quantidadeDiarias" class="text-sm font-semibold text-slate-700">Quantidade de Diárias</label>
							<input 
								type="number" id="quantidadeDiarias" name="quantidadeDiarias" 
								bind:value={quantidade}
								min="0.5" step="0.5"
								class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-lg"
							/>
						</div>

						<div class="space-y-2">
							<label for="tipoDiaria" class="text-sm font-semibold text-slate-700">Tipo de Diária</label>
							<select 
								id="tipoDiaria" name="tipoDiaria" 
								class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
							>
								<option value="Antecipadas">Antecipadas</option>
								<option value="Vencidas">Vencidas</option>
								<option value="Indenização">Indenização</option>
							</select>
						</div>
					</div>

					<div class="pt-6 border-t border-slate-100 space-y-3">
						<div class="flex justify-between text-sm text-slate-500">
							<span>Valor Unitário</span>
							<span class="font-mono font-bold">R$ {valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
						</div>
						<div class="flex justify-between items-end pt-2">
							<span class="font-bold text-slate-800">Total Solicitado</span>
							<span class="text-3xl font-black text-blue-600 font-mono">
								R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
							</span>
						</div>
					</div>
					
					<input type="hidden" name="valorTotalSolicitado" value={valorTotal} />
					
					<button
						type="submit"
						disabled={isSaving}
						class="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 shadow-lg shadow-blue-200 mt-4"
					>
						{#if isSaving}
							<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Processando...
						{:else}
							<Send size={20} />
							Enviar Solicitação
						{/if}
					</button>
				</div>
			</section>

			<div class="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
				<AlertCircle class="text-amber-600 shrink-0" size={20} />
				<p class="text-xs text-amber-800 font-medium leading-relaxed">
					Certifique-se de que todos os dados estão corretos. Após o envio, a solicitação passará por análise da contabilidade e do prefeito.
				</p>
			</div>
		</div>
	</form>
</div>
