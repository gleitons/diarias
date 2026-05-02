# Ideias para Sistema de Diárias

## Visão geral
Construiremos um portal **SvelteKit** para gerenciar as diárias dos servidores da Prefeitura de Lagoa dos Patos (MG). O sistema terá três tipos de usuários:
- **Solicitante** (servidor) – cria a solicitação de diária;
- **Administrador de Diárias** – aprova ou rejeita solicitações;
- **Administrador Geral** – gerencia brasão, nome da prefeitura, cidades, zonas de preço e configurações.

---

## Camadas e Tecnologias
| Camada | Tecnologias | Funções principais |
|--------|-------------|----------------------|
| Front‑end | SvelteKit + Tailwind (ou CSS custom) | UI responsiva, formulários, tabelas, geração de PDF |
| API/Back‑end | SvelteKit endpoints (`src/routes/api/*`) | Regras de preço, scraping de distância, CRUD, geração de PDF |
| Persistência | SQLite (local) + Turso (SQLite‑as‑service) via Drizzle ORM | Tabelas de usuários, cidades, diárias, zonas de preço, logs de scraping |
| Scraping | Node + node‑fetch + cheerio (ou puppeteer) | Busca em **distanciasentrecidades.com**, armazena distâncias |
| PDF | pdf-lib (ou @pdftron/pdfjs) | Gera folha de diária pronta para impressão |

---

## Modelagem de Dados (Drizzle + SQLite)
```ts
// src/lib/db/schema.ts
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  role: text('role').$default('solicitante').notNull(), // solicitante | adm_diarias | adm_geral
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const cities = sqliteTable('cities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  state: text('state').notNull(),
  distanceFromCapital: real('distance_from_capital'), // km até Belo Horizonte
});

export const priceZones = sqliteTable('price_zones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  maxDistance: real('max_distance').notNull(), // km
  price: real('price').notNull(),
});

export const daily_requests = sqliteTable('daily_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  originCityId: integer('origin_city_id').references(() => cities.id).notNull(),
  destCityId: integer('dest_city_id').references(() => cities.id).notNull(),
  distance: real('distance').notNull(),
  price: real('price').notNull(),
  eventType: text('event_type').notNull(), // Congresso, Seminário, Reunião, etc.
  eventName: text('event_name').notNull(),
  objective: text('objective').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  status: text('status').$default('pendente').notNull(), // pendente | aprovada | rejeitada
});
```

---

## Fluxo de Usuário
| Papel | Tela | Ações |
|------|------|-------|
| **Solicitante** | `+page.svelte` (Solicitar Diária) | Selecionar cidade de origem e destino → cálculo automático de distância (cache ou scraping) → exibir preço (regra de zona) → enviar solicitação |
| **Administrador de Diárias** | `admin-diarias.svelte` | Listar solicitações pendentes → Aprovar / Rejeitar → editar preço manualmente se necessário |
| **Administrador Geral** | `admin-geral.svelte` | Gerenciar brasão e nome da prefeitura (tabela `settings`) → CRUD de cidades e zonas de preço → visualizar logs de scraping → atualizar logo / tema |

---

## Regras de Preço
```ts
function calcularPreco(distancia: number, zones: PriceZone[]) {
  const zona = zones.find(z => distancia <= z.maxDistance) ?? zones[zones.length - 1];
  return zona.price;
}
```
**Exemplo de zonas**
| Zona | Até km | Preço (R$) |
|------|--------|-----------|
| 1 | 0‑50 | 150 |
| 2 | 51‑150 | 250 |
| 3 | 151‑300 | 400 |
| 4 | >300 | 600 |
**Exceções**
- Capital Federal (Brasília) – preço fixo (ex.: **800**).
- Capital Estadual (Belo Horizonte) – preço fixo (ex.: **700**).

---

## Scraping de Distância
```ts
// src/lib/scraper.ts
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export async function fetchDistance(origin: string, destination: string): Promise<number> {
  const url = `https://www.distanciasentrecidades.com/${origin}-${destination}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch distance');
  const html = await res.text();
  const $ = cheerio.load(html);
  const txt = $('strong')
    .filter((_, el) => $(el).text().includes('Distância'))
    .first()
    .text();
  const match = txt.match(/([\d,.]+)\s*km/i);
  if (!match) throw new Error('Could not parse distance');
  return parseFloat(match[1].replace(',', '.'));
}
```
*Agendamento opcional*: usar `node-cron` ou GitHub Actions para rodar o scraper diariamente e atualizar a tabela `cities`.

---

## API de Diárias (SvelteKit endpoints)
```ts
// src/routes/api/diarias/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/db/client';
import { daily_requests, cities, priceZones } from '$lib/db/schema';
import { fetchDistance } from '$lib/scraper';

export async function POST({ request }) {
  const { userId, originCity, destCity } = await request.json();
  const origin = await db.select().from(cities).where(eq(cities.name, originCity)).get();
  const dest   = await db.select().from(cities).where(eq(cities.name, destCity)).get();
  const distance = dest?.distanceFromCapital ?? await fetchDistance(origin.name, dest.name);
  const zones = await db.select().from(priceZones).all();
  const price = calcularPreco(distance, zones);
  const inserted = await db
    .insert(daily_requests)
    .values({ userId, originCityId: origin.id, destCityId: dest.id, distance, price })
    .returning();
  return json({ success: true, request: inserted[0] });
}
```
*GET* endpoints para listagens (`/api/diarias/pending`, `/api/users/me`, etc.) também são necessários.

---

## Geração de PDF
```ts
export async function generatePdf(diaria: DailyRequest): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const draw = (text: string, y: number) => {
    page.drawText(text, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });
  };
  draw(`Diária nº ${diaria.id}`, 770);
  draw(`Solicitante: ${diaria.userName}`, 750);
  draw(`Origem: ${diaria.originCity}`, 730);
  draw(`Destino: ${diaria.destCity}`, 710);
  draw(`Evento: [${diaria.eventType}] ${diaria.eventName}`, 690);
  draw(`Objetivo: ${diaria.objective}`, 670);
  draw(`Distância: ${diaria.distance.toFixed(1)} km`, 650);
  draw(`Valor: R$ ${diaria.price.toFixed(2)}`, 630);
  draw(`Data: ${new Date(diaria.createdAt).toLocaleDateString()}`, 610);
  return await doc.save();
}
```
Endpoint de download:
```ts
// src/routes/api/diarias/[id]/pdf/+server.ts
export async function GET({ params }) {
  const { id } = params;
  const diaria = await db.select().from(daily_requests).where(eq(daily_requests.id, Number(id))).get();
  const bytes = await generatePdf(diaria);
  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="diaria-${id}.pdf"`
    }
  });
}
```

---

## Autenticação & Controle de Acesso
Utilizar **lucia‑auth** (ou outra lib) com sessão cookie.
```ts
// src/hooks.server.ts
export async function handle({ event, resolve }) {
  const session = event.cookies.get('session');
  if (session) {
    const user = await getUserFromSession(session);
    event.locals.user = user;
  }
  return resolve(event);
}
```
Cada endpoint verifica `event.locals.user.role` para aplicar permissões.

---

## UI / Design (estética premium)
- Tema escuro + claro com gradientes e **glass‑morphism**;
- Tipografia **Inter** (Google Fonts);
- Header com brasão e nome configuráveis;
- Cards com sombra sutil e animação hover;
- Botão “Calcular” com spinner micro‑animação;
- Tabela de histórico estilo DataTables, linhas alternadas, filtro por status;
- Modal de aprovação com fundo semi‑transparente, botões verde (aprovar) e vermelho (rejeitar).

---

## Roadmap de Implementação
| Sprint | Entregáveis |
|-------|-------------|
| 1 | Configurar Drizzle + SQLite (local) → conectar ao Turso; criar tabelas básicas |
| 2 | Implementar autenticação + middleware de roles |
| 3 | Criar rotas API (`/api/diarias`, `/api/cities`, `/api/price‑zones`) |
| 4 | Construir UI das três páginas com layout premium |
| 5 | Implementar scraper + rotina de atualização de distâncias |
| 6 | Implementar cálculo automático de preço e validações |
| 7 | Geração de PDF + download automático |
| 8 | Testes unitários/e2e e ajustes de responsividade |
| 9 | Deploy (Vercel/Netlify/Railway) apontando para Turso |

---

## Próximos Passos para Você
- Definir as faixas de preço e valores para Brasília e Belo Horizonte;
- Listar as cidades que farão parte do sistema (começar pela capital municipal e cidades vizinhas);
- Aprovar o design visual (ou solicitar mockups);
- Decidir a frequência do scraping (diária, semanal);
- Confirmar método de autenticação (login tradicional ou SSO da prefeitura).

*Com essas informações podemos avançar para a primeira implementação de schemas e rotas ou produzir os primeiros mockups de UI.*
