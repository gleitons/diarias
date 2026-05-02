import { db } from './index';
import { settings } from './schema';

async function seed() {
	console.log('Seeding settings...');
	
	const existing = await db.select().from(settings).get();
	
	if (!existing) {
		await db.insert(settings).values({
			prefeituraNome: 'Prefeitura Municipal de Lagoa dos Patos',
			prefeituraEndereco: 'Praça 31 de Março, 111 - Centro - Lagoa dos Patos-MG',
			prefeituraCep: '39360-000',
			prefeituraLei: 'Lei No. 766/2017 (Decreto no. 32/2019)',
		});
		console.log('Settings seeded successfully!');
	} else {
		console.log('Settings already exist, skipping seed.');
	}
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
