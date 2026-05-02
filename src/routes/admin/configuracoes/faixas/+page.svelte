<script lang="ts">
	import { enhance } from '$app/forms';
	import { Landmark, Trash2, Plus, Save, MapPin, Calculator, Info } from 'lucide-svelte';

	let { data, form } = $props();
	let isSaving = $state(false);
</script>

<div class="space-y-8 pb-12">
	<header>
		<h2 class="text-3xl font-black text-slate-800">Faixas de Preço</h2>
		<p class="text-slate-500">Configure os valores das diárias de acordo com a distância da viagem.</p>
	</header>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Tabela de Faixas -->
		<div class="lg:col-span-2 space-y-6">
			<div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
				<table class="w-full text-left">
					<thead class="bg-slate-50 border-b border-slate-100">
						<tr>
							<th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Até (KM)</th>
							<th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Valor da Diária</th>
							<th class="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-50">
						{#each data.zones as zone}
							<tr class="hover:bg-slate-50/50 transition-colors group">
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
											<MapPin size={16} />
										</div>
										<span class="font-bold text-slate-700">{zone.maxDistance} KM</span>
									</div>
								</td>
								<td class="px-6 py-4">
									<span class="font-black text-slate-800 text-lg">R$ {zone.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
								</td>
								<td class="px-6 py-4 text-right">
									<form method="POST" action="?/delete" use:enhance class="inline-block">
										<input type="hidden" name="id" value={zone.id} />
										<button type="submit" class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
											<Trash2 size={18} />
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			
			<div class="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
				<Info class="text-blue-600 shrink-0" size={24} />
				<div class="space-y-1">
					<p class="text-sm font-bold text-blue-900">Como funciona o cálculo?</p>
					<p class="text-xs text-blue-700 leading-relaxed">
						O sistema busca a primeira faixa onde a distância da viagem (ida) seja menor ou igual ao valor definido. 
						A última faixa cadastrada serve como o valor máximo para qualquer distância superior.
					</p>
				</div>
			</div>
		</div>

		<!-- Formulário de Adição -->
		<div class="space-y-6">
			<section class="bg-slate-900 rounded-3xl shadow-xl p-8 text-white space-y-6 sticky top-8">
				<div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
					<Plus size={20} />
					Nova Faixa
				</div>

				<form method="POST" action="?/save" use:enhance={() => { isSaving = true; return async ({update}) => { isSaving = false; update(); } }} class="space-y-6">
					<div class="space-y-2">
						<label for="maxDistance" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Distância Máxima (KM)</label>
						<div class="relative">
							<input 
								type="number" id="maxDistance" name="maxDistance" step="0.01" required
								placeholder="Ex: 150"
								class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
							/>
							<span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">KM</span>
						</div>
					</div>

					<div class="space-y-2">
						<label for="price" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor da Diária (R$)</label>
						<div class="relative">
							<span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">R$</span>
							<input 
								type="number" id="price" name="price" step="0.01" required
								placeholder="0,00"
								class="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
							/>
						</div>
					</div>

					<button 
						type="submit" 
						disabled={isSaving}
						class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
					>
						{#if isSaving}
							<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Salvando...
						{:else}
							<Save size={18} />
							Salvar Faixa
						{/if}
					</button>
				</form>
			</section>
		</div>
	</div>
</div>
