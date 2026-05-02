import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { destinations } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export const GET: RequestHandler = async ({ url }) => {
    const origem = url.searchParams.get('origem') || 'Lagoa dos Patos';
    const destino = url.searchParams.get('destino');
    const uf = url.searchParams.get('uf') || 'MG';

    if (!destino) {
        return json({ error: 'Destino não fornecido.' }, { status: 400 });
    }

    // 1. Check Cache
    const cached = await db.select()
        .from(destinations)
        .where(and(
            eq(destinations.city, destino),
            eq(destinations.state, uf)
        ))
        .get();

    if (cached) {
        return json({ distance: cached.distance, source: 'cache' });
    }

    // 2. Scrape
    const slugOrigem = slugify(origem);
    const slugDestino = slugify(destino);

    try {
        const fetchUrl = `https://www.distanciasentrecidades.com/distancia-${slugOrigem}-a-${slugDestino}`;
        const response = await fetch(fetchUrl);
        const html = await response.text();

        const match = html.match(/Distância de condução:\s*([\d,.]+)\s*km/i) || html.match(/([\d,.]+)\s*km/i);
        
        if (match) {
            const distance = parseFloat(match[1].replace(',', '.'));
            
            // 3. Save to Cache
            await db.insert(destinations).values({
                city: destino,
                state: uf,
                distance
            });

            return json({ distance, source: 'scraped', url: fetchUrl });
        }

        return json({ error: 'Distância não encontrada no site.', url: fetchUrl }, { status: 404 });
    } catch (error) {
        console.error('Erro ao buscar distância:', error);
        return json({ error: 'Erro ao conectar ao serviço de distâncias.' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    const { city, state, distance } = await request.json();

    if (!city || !state || distance === undefined) {
        return json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const existing = await db.select()
        .from(destinations)
        .where(and(
            eq(destinations.city, city),
            eq(destinations.state, state)
        ))
        .get();

    if (existing) {
        await db.update(destinations)
            .set({ distance })
            .where(eq(destinations.id, existing.id));
    } else {
        await db.insert(destinations).values({
            city,
            state,
            distance
        });
    }

    return json({ success: true });
};
