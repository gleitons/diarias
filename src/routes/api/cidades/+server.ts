import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const estado = url.searchParams.get('estado');

    if (!estado) {
        return json({ error: 'Estado não fornecido.' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://www.falecidosnobrasil.org.br/busca_cidade2.php?id_estado=${estado.toLowerCase()}`);
        const data = await response.json();
        return json(data);
    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        return json({ error: 'Erro ao buscar cidades.' }, { status: 500 });
    }
};
