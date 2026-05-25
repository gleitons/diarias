<script lang="ts">
	import { FilePlus, ClipboardCheck, History, ShieldAlert, ArrowRight } from "lucide-svelte";
	
	let { data } = $props();
	// console.log(data);
</script>

<div class="space-y-12 py-6">
	<!-- Hero Section -->
	<section class="relative overflow-hidden   rounded-[2.5rem] p-8 md:p-8 text-black shadow-2xl shadow-blue-200">
		<div class="relative z-10 max-w-2xl space-y-6 text-black">
			{#if data.user}
				<h2 class="text-4xl md:text-5xl font-black leading-tight">Olá, {data.user.name.split(' ')[0]}!</h2>
				<p class=" text-lg font-medium">Bem-vindo ao Sistema de Gestão de Diárias. O que deseja fazer hoje?</p>
				{#if !data.user.bancoNome}
					<p class=" text-lg font-medium">Antes de iniciar suas solicitações de diárias você deve atualizar seu perfil e dados bancários.</p>
					<a href="/perfil" class="px-5 w-fit py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2">Atualizar Perfil</a>
				{/if}
			{:else}
				<h2 class="text-4xl md:text-5xl font-black leading-tight">Gestão de Diárias Municipal</h2>
				<p class="text-black text-lg font-medium">Sistema para solicitação e prestação de contas de viagens da Prefeitura de Lagoa dos Patos.</p>
				<div class="flex gap-4 pt-4">
					<a href="/login" class="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg">
						Entrar no Sistema
						<ArrowRight size={20} />
					</a>
				</div>
			{/if}
		</div>
		
		<!-- Decorative blobs -->
		<div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
		<div class="absolute -right-40 -bottom-40 w-96 h-96 bg-blue-700 rounded-full blur-3xl opacity-50"></div>
	</section>

	{#if data.user}
		<!-- Quick Actions -->
		<section class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<a href="/solicitar" class="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
				<div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
					<FilePlus size={28} />
				</div>
				<h3 class="text-xl font-bold text-slate-800 mb-2">Solicitar Diária</h3>
				<p class="text-slate-500 text-sm leading-relaxed">Inicie um novo processo de diária preenchendo o Anexo II.</p>
			</a>

			<a href="/minhas-diarias" class="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
				<div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
					<ClipboardCheck size={28} />
				</div>
				<h3 class="text-xl font-bold text-slate-800 mb-2">Prestação de Contas</h3>
				<p class="text-slate-500 text-sm leading-relaxed">Envie o relatório de viagem para homologação final (Anexo III).</p>
			</a>

			<a href="/minhas-diarias" class="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
				<div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
					<History size={28} />
				</div>
				<h3 class="text-xl font-bold text-slate-800 mb-2">Histórico</h3>
				<p class="text-slate-500 text-sm leading-relaxed">Acompanhe todos os seus processos e baixe os PDFs assinados.</p>
			</a>
		</section>

		{#if data.user.role === 'adm_diarias' || data.user.role === 'adm_geral'}
			<section class="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
				<div class="space-y-4">
					<div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
						<ShieldAlert size={16} />
						Área do Administrador
					</div>
					<h3 class="text-3xl font-black">Gestão de Processos</h3>
					<p class="text-slate-400 max-w-md">Analise solicitações, emita pareceres contábeis e homologue as diárias dos servidores.</p>
				</div>
				<a href="/admin/diarias" class="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-lg">
					Acessar Painel Admin
				</a>
			</section>
		{/if}
	{/if}
</div>
