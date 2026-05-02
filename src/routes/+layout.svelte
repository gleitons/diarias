<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { FileText, ClipboardList, User, Settings, LogOut, Menu, X, Home, Calendar, ShieldCheck, Users, Search } from 'lucide-svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';

	let { children, data } = $props();
	let isSidebarOpen = $state(false);

	const navItems = [
		{ href: '/', label: 'Início', icon: Home },
		{ href: '/solicitar', label: 'Nova Diária', icon: FileText },
		{ href: '/eventos', label: 'Eventos', icon: Calendar },
		{ href: '/minhas-diarias', label: 'Minhas Diárias', icon: ClipboardList },
		{ href: '/perfil', label: 'Meu Perfil', icon: User },
	];

	const adminNavItems = [
		{ href: '/admin/busca', label: 'Busca por Código', icon: Search },
		{ href: '/admin/diarias', label: 'Análise de Diárias', icon: ShieldCheck },
		{ href: '/admin/configuracoes', label: 'Configurações Gerais', icon: Settings },
		{ href: '/admin/configuracoes/faixas', label: 'Faixas de Preço', icon: Settings },
		{ href: '/admin/usuarios', label: 'Gestão de Usuários', icon: Users },
	];

	async function handleLogout() {
		await authClient.signOut();
		goto('/login');
	}
</script>

<div class="min-h-screen bg-slate-50 flex font-sans text-slate-900">
	<!-- Sidebar Mobile Overlay -->
	{#if isSidebarOpen}
		<div 
			class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
			onclick={() => isSidebarOpen = false}
			onkeydown={(e) => e.key === 'Escape' && (isSidebarOpen = false)}
			role="button"
			tabindex="0"
		></div>
	{/if}

	<!-- Sidebar -->
	<aside class={cn(
		"fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0",
		isSidebarOpen ? "translate-x-0" : "-translate-x-full"
	)}>
		<div class="h-full flex flex-col">
			<!-- Logo -->
			<div class="p-6 border-b border-slate-100 flex items-center gap-3">
				<div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
					<FileText size={24} />
				</div>
				<div>
					<h1 class="font-bold text-lg leading-tight">Diárias</h1>
					<p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Lagoa dos Patos</p>
				</div>
			</div>

			<!-- Nav -->
			<nav class="flex-1 p-4">
				<ul class="space-y-1">
					{#each navItems as item}
						<li>
							<a
								href={item.href}
								onclick={() => (isSidebarOpen = false)}
								class={cn(
									"flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
									page.url.pathname === item.href
										? "bg-blue-600 text-white shadow-lg shadow-blue-200"
										: "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
								)}
							>
								<item.icon size={20} />
								{item.label}
							</a>
						</li>
					{/each}
				</ul>

				{#if data.user && (data.user.role === 'adm_diarias' || data.user.role === 'adm_geral')}
					<div class="mt-8 space-y-4">
						<h3 class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administração</h3>
						<ul class="space-y-1">
							{#each adminNavItems as item}
								<li>
									<a
										href={item.href}
										onclick={() => (isSidebarOpen = false)}
										class={cn(
											"flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
											page.url.pathname === item.href
												? "bg-slate-900 text-white shadow-lg shadow-slate-200"
												: "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
										)}
									>
										<item.icon size={20} />
										{item.label}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</nav>

			<!-- User & Settings -->
			<div class="p-4 border-t border-slate-100">
				{#if data.user}
					<div class="flex items-center gap-3 px-4 py-3 mb-2">
						<div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500">
							{data.user.name.charAt(0)}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold truncate">{data.user.name}</p>
							<p class="text-xs text-slate-500 truncate">{data.user.role}</p>
						</div>
					</div>
					<button 
						onclick={handleLogout}
						class="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
					>
						<LogOut size={18} />
						<span class="text-sm font-medium">Sair</span>
					</button>
				{:else}
					<a href="/login" class="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
						Entrar no Sistema
					</a>
				{/if}
			</div>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
		<!-- Header Mobile -->
		<header class="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
			<button onclick={() => isSidebarOpen = true} class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
				<Menu size={24} />
			</button>
			<h1 class="font-bold text-slate-800">Diárias</h1>
			<div class="w-10"></div>
		</header>

		<!-- Content Scroll Area -->
		<div class="flex-1 overflow-y-auto p-4 lg:p-8">
			<div class="max-w-5xl mx-auto">
				{@render children()}
			</div>
		</div>
	</main>
</div>
