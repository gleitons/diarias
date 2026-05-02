<script lang="ts">
	import { enhance } from '$app/forms';
	import { ClipboardCheck, Calendar, Clock, FileText, CheckSquare, Send, CheckCircle2, AlertCircle } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();
	let isSaving = $state(false);

	let trip = $derived(data.request);
	const isSubmitted = $derived(!!data.existingReport || form?.success);
</script>

<div class="space-y-6 pb-12">
	<header>
		<div class="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2 uppercase tracking-widest">
			<ClipboardCheck size={16} />
			Prestação de Contas
		</div>
		<h2 class="text-2xl font-bold text-slate-800">Relatório de Viagem (Anexo III)</h2>
		<p class="text-slate-500">Forneça os detalhes reais da viagem realizada para finalização do processo.</p>
	</header>

	{#if isSubmitted}
		<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
			<div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
				<CheckCircle2 size={24} />
			</div>
			<div>
				<p class="font-bold">Relatório enviado!</p>
				<p class="text-sm">Sua prestação de contas foi recebida e será analisada.</p>
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
			};
		}}
		class={cn("space-y-8", isSubmitted && "opacity-60 pointer-events-none grayscale-[0.5]")}
	>
		<!-- Realidade da Viagem -->
		<section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
			<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
				<Calendar class="text-blue-600" size={20} />
				<h3 class="font-bold text-slate-800">Datas e Horários Reais</h3>
			</div>
			<div class="p-6 space-y-6">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="space-y-2">
						<label for="dataHoraPartida" class="text-sm font-semibold text-slate-700">Partida (Data e Hora)</label>
						<input 
							type="datetime-local" id="dataHoraPartida" name="dataHoraPartida" 
							required
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						/>
					</div>
					<div class="space-y-2">
						<label for="dataHoraChegada" class="text-sm font-semibold text-slate-700">Chegada (Data e Hora)</label>
						<input 
							type="datetime-local" id="dataHoraChegada" name="dataHoraChegada" 
							required
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
						/>
					</div>
					<div class="space-y-2">
						<label for="quantidadePernoites" class="text-sm font-semibold text-slate-700">Quantidade de Pernoites</label>
						<input 
							type="number" id="quantidadePernoites" name="quantidadePernoites" 
							required min="0"
							placeholder="Ex: 1"
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Relatório Detalhado -->
		<section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
			<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
				<FileText class="text-blue-600" size={20} />
				<h3 class="font-bold text-slate-800">Relatório Pormenorizado</h3>
			</div>
			<div class="p-6">
				<p class="text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">Especificar locais onde o servidor esteve ou executou serviços</p>
				<textarea 
					id="relatorioDetalhado" name="relatorioDetalhado" 
					required
					rows="6"
					placeholder="Descreva as atividades desenvolvidas durante a viagem..."
					class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
				></textarea>
			</div>
		</section>

		<!-- Checklist e Declaração -->
		<section class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
				<div class="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
					<CheckSquare class="text-blue-600" size={20} />
					<h3 class="font-bold text-slate-800">Documentos Anexados</h3>
				</div>
				<div class="p-6 space-y-4">
					<label class="flex items-center gap-3 cursor-pointer group">
						<input type="checkbox" name="anexoPassagens" class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
						<span class="text-sm font-medium text-slate-700">Comprovantes originais de passagem</span>
					</label>
					<label class="flex items-center gap-3 cursor-pointer group">
						<input type="checkbox" name="anexoCartoesEmbarque" class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
						<span class="text-sm font-medium text-slate-700">Cartões de embarque</span>
					</label>
					<label class="flex items-center gap-3 cursor-pointer group">
						<input type="checkbox" name="anexoAutorizacaoVeiculo" class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
						<span class="text-sm font-medium text-slate-700">Autorização para circulação do veículo</span>
					</label>
					<label class="flex items-center gap-3 cursor-pointer group">
						<input type="checkbox" name="anexoComprovanteParticipacao" class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
						<span class="text-sm font-medium text-slate-700">Comprovante de participação</span>
					</label>
				</div>
			</div>

			<div class="bg-slate-900 rounded-2xl shadow-xl p-8 text-white flex flex-col justify-between">
				<div class="space-y-4">
					<h3 class="font-bold text-lg">Declaração</h3>
					<p class="text-sm text-slate-400 leading-relaxed italic">
						"Declaro que não possuo residência própria na cidade para qual me desloquei e que consta neste relatório..."
					</p>
					<label class="flex items-center gap-3 cursor-pointer group mt-6 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
						<input type="checkbox" name="inexistenciaResidenciaPropria" checked required class="w-5 h-5 rounded text-blue-500 focus:ring-blue-500 bg-transparent border-white/20" />
						<span class="text-sm font-bold">Aceito os termos da declaração</span>
					</label>
				</div>

				<button 
					type="submit" 
					disabled={isSaving || isSubmitted}
					class="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 mt-8"
				>
					{#if isSaving}
						<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						Enviando...
					{:else}
						<Send size={20} />
						Finalizar Prestação de Contas
					{/if}
				</button>
			</div>
		</section>
	</form>
</div>
