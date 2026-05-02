import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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
    const origem = url.searchParams.get('origem') || 'lagoa-dos-patos';
    const destino = url.searchParams.get('destino');

    if (!destino) {
        return json({ error: 'Destino não fornecido.' }, { status: 400 });
    }

    const slugOrigem = slugify(origem);
    const slugDestino = slugify(destino);

    try {
        const fetchUrl = `https://www.distanciasentrecidades.com/distancia-${slugOrigem}-a-${slugDestino}`;
        const response = await fetch(fetchUrl);
        const html = await response.text();

        // Basic scraping for the distance in the HTML
        // Usually it's in a text like "Distância de condução: 50 km"
        const match = html.match(/Distância de condução:\s*([\d,.]+)\s*km/i);
        
        if (match) {
            const distance = parseFloat(match[1].replace(',', '.'));
            return json({ distance, url: fetchUrl });
        }

        // Fallback: try to find any "km" after a number in a specific div
        const matchAlt = html.match(/([\d,.]+)\s*km/i);
        if (matchAlt) {
            const distance = parseFloat(matchAlt[1].replace(',', '.'));
            return json({ distance, url: fetchUrl });
        }

        return json({ error: 'Distância não encontrada no site.', url: fetchUrl }, { status: 404 });
    } catch (error) {
        console.error('Erro ao buscar distância:', error);
        return json({ error: 'Erro ao conectar ao serviço de distâncias.' }, { status: 500 });
    }
};
