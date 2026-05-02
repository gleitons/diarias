import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import * as dotenv from 'dotenv';

dotenv.config();

const settings = sqliteTable('settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	prefeituraNome: text('prefeitura_nome').notNull(),
	prefeituraEndereco: text('prefeitura_endereco'),
	prefeituraCep: text('prefeitura_cep'),
	prefeituraLei: text('prefeitura_lei').default('Lei No. 766/2017 (Decreto no. 32/2019)'),
	logoUrl: text('logo_url'),
});

const priceZones = sqliteTable('price_zones', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	maxDistance: real('max_distance').notNull(),
	price: real('price').notNull(),
});

async function seed() {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error('DATABASE_URL is not set');
	
	const client = createClient({ url });
	const db = drizzle(client);

	console.log('Seeding settings and price zones...');
	
	try {
		// Seed Settings
		const existingSettings = await db.select().from(settings).all();
		if (existingSettings.length === 0) {
			await db.insert(settings).values({
				prefeituraNome: 'Prefeitura Municipal de Lagoa dos Patos',
				prefeituraEndereco: 'Praça 31 de Março, 111 - Centro - Lagoa dos Patos-MG',
				prefeituraCep: '39360-000',
				prefeituraLei: 'Lei No. 766/2017 (Decreto no. 32/2019)',
			});
			console.log('Settings seeded successfully!');
		}

		// Seed Price Zones
		const existingZones = await db.select().from(priceZones).all();
		if (existingZones.length === 0) {
			await db.insert(priceZones).values([
				{ maxDistance: 50, price: 150 },
				{ maxDistance: 150, price: 250 },
				{ maxDistance: 300, price: 400 },
				{ maxDistance: 999999, price: 600 },
			]);
			console.log('Price zones seeded successfully!');
		}
	} catch (e) {
		console.error('Error during seed:', e);
	}
}

seed().catch(console.error);
