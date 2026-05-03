import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { dailyRequests, user, settings, accountabilityReports } from './db/schema';
import  {formatCpf, formatPhone}  from '$lib/functions/all';

type Request = typeof dailyRequests.$inferSelect;
type User = typeof user.$inferSelect;
type Settings = typeof settings.$inferSelect;
type Report = typeof accountabilityReports.$inferSelect;

export async function generateAnexoII(request: Request, user: User, settings: Settings) {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595.28, 841.89]); // A4
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	const { width, height } = page.getSize();
	const margin = 40;

	const drawText = (text: string, x: number, y: number, size = 9, isBold = false) => {
		page.drawText(text || '', {
			x,
			y: height - y,
			size,
			font: isBold ? fontBold : font,
			color: rgb(0, 0, 0),
		});
	};

	const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 1) => {
		page.drawLine({
			start: { x: x1, y: height - y1 },
			end: { x: x2, y: height - y2 },
			thickness,
			color: rgb(0, 0, 0),
		});
	};

	const drawRect = (x: number, y: number, w: number, h: number, thickness = 1) => {
		page.drawRectangle({
			x,
			y: height - y - h,
			width: w,
			height: h,
			borderWidth: thickness,
			borderColor: rgb(0, 0, 0),
		});
	};

	// --- HEADER ---
	if (settings.logoUrl) {
		try {
			const logoBytes = await fetch(settings.logoUrl).then(res => res.arrayBuffer());
			let logoImage;
			if (settings.logoUrl.toLowerCase().endsWith('.png')) {
				logoImage = await pdfDoc.embedPng(logoBytes);
			} else {
				logoImage = await pdfDoc.embedJpg(logoBytes);
			}
			page.drawImage(logoImage, {
				x: margin + 10,
				y: height - 70,
				width: 50,
				height: 50,
			});
		} catch (e) {
			console.error('Error embedding logo Anexo II:', e);
		}
	}

	drawText(settings.prefeituraNome.toUpperCase(), width/2 - 150, 40, 14, true);
	drawText(settings.prefeituraEndereco.toUpperCase(), width/2 - 130, 55, 8);
	drawText(`CEP ${settings.prefeituraCep}`, width/2 - 40, 68, 8);
	drawLine(margin, 75, width - margin, 75, 1.5);
	
	drawText('LEI NO. 766/2017 (Decreto no. 32/2019)', width/2 - 100, 90, 10, true);
	drawText('ANEXO II - FORMULÁRIO DE SOLICITAÇÃO DE DIÁRIA', width/2 - 130, 105, 11, true);

	// --- MAIN TABLE BOX ---
	const boxStart = 115;
	const boxWidth = width - (margin * 2);
	drawRect(margin, boxStart, boxWidth, 680);

	// Row: Prefeitura / Solicitação / Exercício
	drawLine(margin, boxStart + 45, width - margin, boxStart + 45);
	drawLine(margin + 100, boxStart, margin + 100, boxStart + 45);
	drawLine(margin + 265, boxStart, margin + 265, boxStart + 45);
	
	drawText('Prefeitura', margin + 25, boxStart + 15, 8, true);
	drawText('Municipal de', margin + 20, boxStart + 25, 8, true);
	drawText('Lagoa dos Patos', margin + 15, boxStart + 35, 8, true);
	
	drawText('Solicitação de', margin + 130, boxStart + 18, 10, true);
	drawText('Diárias/Indenização/Passagem', margin + 115, boxStart + 30, 10, true);
	
	drawText('Exercício', margin + 270, boxStart + 12, 8);
	drawText(request.exercicio.toString(), margin + 350, boxStart + 18, 10, true);
	drawLine(margin + 265, boxStart + 22, width - margin, boxStart + 22);
	drawText('Data:', margin + 270, boxStart + 35, 8);
	drawText(new Date(request.dataSolicitacao).toLocaleDateString('pt-BR'), margin + 310, boxStart + 35, 10, true);

	// Personal Info
	const rowHeight = 25;
	let currentY = boxStart + 45;
	drawText(`Nome: ${user.name}`, margin + 5, currentY + 15, 10);
	drawLine(margin + 315, currentY, margin + 315, currentY + rowHeight);
	drawText(`Matrícula: ${user.matricula || ''}`, margin + 320, currentY + 15, 10);
	currentY += rowHeight;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Unidade Administrativa de Exercício:`, margin + 5, currentY + 10, 8);
	drawText(user.unidadeAdministrativa || '', margin + 5, currentY + 22, 10, true);
	drawLine(margin + 315, currentY, margin + 315, currentY + 35);
	drawText(`CPF:`, margin + 320, currentY + 10, 8);
	drawText(formatCpf(user.cpf || ''), margin + 320, currentY + 22, 10, true);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Cargo Municipal:`, margin + 5, currentY + 10, 8);
	drawText(user.cargo || '', margin + 5, currentY + 22, 10, true);
	drawLine(margin + 315, currentY, margin + 315, currentY + 35);
	drawText(`Quantidade diárias:`, margin + 325, currentY + 10, 8);
	drawText(request.quantidadeDiarias.toString(), margin + 380, currentY + 25, 14, true);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	// Bank Row
	drawText(`Nome do Banco`, margin + 30, currentY + 10, 8);
	drawText(user.bancoNome || '', margin + 20, currentY + 22, 9, true);
	drawLine(margin + 120, currentY, margin + 120, currentY + 35);
	
	drawText(`Cód. Agência:`, margin + 130, currentY + 10, 8);
	drawText(user.bancoAgenciaCod || '', margin + 140, currentY + 22, 9, true);
	drawLine(margin + 235, currentY, margin + 235, currentY + 35);

	drawText(`Nº Agência`, margin + 255, currentY + 10, 8);
	drawText(user.bancoAgenciaNum || '', margin + 255, currentY + 22, 9, true);
	drawLine(margin + 350, currentY, margin + 350, currentY + 35);

	drawText(`Nº da Conta / Tipo:`, margin + 360, currentY + 10, 8);
	drawText(`${user.bancoContaNum || ''} (${user.bancoTipoConta || ''})`, margin + 360, currentY + 22, 9, true);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	// Tipo de Diária
	drawText('Tipo de Diária:', margin + 5, currentY + 12, 9, true);
	const tipo = request.tipoDiaria;
	drawText(`( ${tipo === 'Antecipadas' ? 'x' : ' '} ) Antecipadas`, margin + 50, currentY + 25, 9);
	drawText(`( ${tipo === 'Vencidas' ? 'x' : ' '} ) Vencidas`, margin + 230, currentY + 25, 9);
	drawText(`( ${tipo === 'Indenização' ? 'x' : ' '} ) Indenização`, margin + 360, currentY + 25, 9);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	// Viagens Previstas
	drawText('Viagens Previstas Período:', margin + 5, currentY + 12, 9);
	drawText(`Saída: ${new Date(request.dataSaida).toLocaleDateString('pt-BR')} às ${request.horaSaida || '__:__'}`, margin + 80, currentY + 25, 10, true);
	drawText(`Retorno: ${new Date(request.dataRetorno).toLocaleDateString('pt-BR')} às ${request.horaRetorno || '__:__'}`, margin + 280, currentY + 25, 10, true);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	// Meio de Transporte
	drawText('Meio de Transporte_', margin + 250, currentY + 12, 9);
	drawText(`Veículo Oficial:   Sim ( ${request.meioTransporte === 'Oficial' ? 'x' : ' '} )  Não ( ${request.meioTransporte !== 'Oficial' ? 'x' : ' '} )   Placa: ${request.veiculoOficialPlaca || '_______'}`, margin + 115, currentY + 25, 9);
	drawLine(margin, currentY + 35, width - margin, currentY + 35);
	drawText(`Viagem em transporte Intermunicipal:  Avião ( ) Ônibus ( ) Outro ( ) Van`, margin + 10, currentY + 48, 9);
	currentY += 55;
	drawLine(margin, currentY, width - margin, currentY);

	// Destino
	drawText('Cidade de destino/UF - ' + (request.destinoCidadeUf || ''), width/2 - 100, currentY + 18, 11, true);
	currentY += 30;
	drawLine(margin, currentY, width - margin, currentY);

	// Particular
	drawText(`Viagem em Veículo particular:  ( ${request.veiculoParticular ? 'x' : ' '} ) Sim, Justifique. ( ${!request.veiculoParticular ? 'x' : ' '} ) Não`, margin + 5, currentY + 12, 9);
	drawText(`Justificativa: ${request.justificativaVeiculoParticular || ''}`, margin + 5, currentY + 25, 9);
	drawLine(margin, currentY + 35, width - margin, currentY + 35);
	drawText(`Distância entre a sede do município e local de destino de Ida e Volta:`, margin + 5, currentY + 45, 8);
	drawText(`${request.distanciaIdaVolta} KM`, margin + 400, currentY + 45, 10, true);
	currentY += 55;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Valor Indenização: R$ ${Number(request.valorIndenizacaoKm || 0.8).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/Km Rodado`, margin + 5, currentY + 15, 9);
	drawLine(margin + 210, currentY, margin + 210, currentY + rowHeight);
	currentY += rowHeight;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Dados veículo Próprio: ${request.dadosVeiculoProprio || ''}`, margin + 5, currentY + 15, 9);
	currentY += rowHeight;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Objetivo da Viagem: ${request.objetivoViagem}`, margin + 5, currentY + 15, 10, true);
	currentY += rowHeight;
	drawLine(margin, currentY, width - margin, currentY);

	// --- EXPENSES TABLE ---
	drawText('Despesas', margin + 70, currentY + 15, 9, true);
	drawLine(margin + 160, currentY, margin + 160, currentY + 110);
	drawText('Valor Solicitado', margin + 220, currentY + 15, 9, true);
	drawLine(margin + 360, currentY, margin + 360, currentY + 110);
	drawText('Valor Aprovado', margin + 400, currentY + 10, 9, true);
	drawText('Aprovado', margin + 400, currentY + 20, 9, true);
	currentY += rowHeight;
	drawLine(margin, currentY, width - margin, currentY);

	drawText('2 Diárias', margin + 70, currentY + 15, 9);
	drawText(`R$ ${request.valorDiariasSolicitado.toFixed(2)}`, margin + 220, currentY + 15, 10, true);
	drawText(`R$ ${request.valorDiariasSolicitado.toFixed(2)}`, margin + 400, currentY + 15, 10, true);
	currentY += rowHeight;
	drawLine(margin, currentY, width - margin, currentY);

	drawText('Passagem', margin + 70, currentY + 15, 9);
	currentY += 20;
	drawLine(margin, currentY, width - margin, currentY);

	drawText('Indenização - transporte', margin + 40, currentY + 15, 9);
	currentY += 20;
	drawLine(margin, currentY, width - margin, currentY);

	drawText('Total', margin + 70, currentY + 15, 10, true);
	drawText(`R$ ${request.valorTotalSolicitado.toFixed(2)}`, margin + 220, currentY + 15, 10, true);
	drawText(`R$ ${request.valorTotalSolicitado.toFixed(2)}`, margin + 400, currentY + 15, 10, true);
	currentY += 25;
	drawLine(margin, currentY, width - margin, currentY);

	// Declaration and Signatures
	drawText('Declaro que o valor recebido refere-se ao pagamento para custeio de despesas em', margin + 15, currentY + 15, 8);
	drawText('decorrência de viagem a serviço da municipalidade, conforme demonstração supra,', margin + 15, currentY + 25, 8);
	drawText('que deverei prestar contas nos termos da Lei Municipal no. 766, de 14.08.2017.', margin + 15, currentY + 35, 8);
	currentY += 45;
	
	drawRect(margin + 5, currentY, boxWidth - 10, 100);
	drawText(`Local/Data: Lagoa dos Patos, ${new Date(request.dataSolicitacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin + 10, currentY + 15, 10);
	drawText(`Assinatura do Servidor/Assessor Jurídico – Procuradoria: ____________________________`, margin + 10, currentY + 35, 9);
	
	drawText(`(  ) Solicitação Deferida     (  ) Solicitação Indeferida`, margin + 10, currentY + 55, 10);
	
	drawLine(margin + 15, currentY + 80, margin + 130, currentY + 80);
	drawText('Secretário', margin + 45, currentY + 90, 9);
	
	drawLine(width - margin - 130, currentY + 80, width - margin - 15, currentY + 80);
	if (settings.prefeitoNome) {
		drawText(settings.prefeitoNome.toUpperCase(), width - margin - 130, currentY + 90, 8, true);
		drawText('Prefeito Municipal', width - margin - 110, currentY + 100, 8);
	} else {
		drawText('Prefeito Municipal', width - margin - 110, currentY + 90, 9);
	}

	// Footer Data de Impressão
	drawText(`Impresso em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, margin, 810, 7);

	return Buffer.from(await pdfDoc.save());
	// const blob = new Blob([await pdfDoc.save()], { type: 'application/pdf' });
	// const blobUrl = URL.createObjectURL(blob);
	// window.open(blobUrl, '_blank');



}

export async function generateAnexoIII(request: Request, user: User, settings: Settings, report: Report) {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595.28, 841.89]); // A4
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	const { width, height } = page.getSize();
	const margin = 40;

	const drawText = (text: string, x: number, y: number, size = 9, isBold = false) => {
		page.drawText(text || '', {
			x,
			y: height - y,
			size,
			font: isBold ? fontBold : font,
			color: rgb(0, 0, 0),
		});
	};

	const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 1) => {
		page.drawLine({
			start: { x: x1, y: height - y1 },
			end: { x: x2, y: height - y2 },
			thickness,
			color: rgb(0, 0, 0),
		});
	};

	const drawRect = (x: number, y: number, w: number, h: number, thickness = 1) => {
		page.drawRectangle({
			x,
			y: height - y - h,
			width: w,
			height: h,
			borderWidth: thickness,
			borderColor: rgb(0, 0, 0),
		});
	};

	// --- HEADER ---
	if (settings.logoUrl) {
		try {
			const logoBytes = await fetch(settings.logoUrl).then(res => res.arrayBuffer());
			let logoImage;
			if (settings.logoUrl.toLowerCase().endsWith('.png')) {
				logoImage = await pdfDoc.embedPng(logoBytes);
			} else {
				logoImage = await pdfDoc.embedJpg(logoBytes);
			}
			page.drawImage(logoImage, {
				x: margin + 10,
				y: height - 70,
				width: 50,
				height: 50,
			});
		} catch (e) {
			console.error('Error embedding logo Anexo III:', e);
		}
	}

	drawText(settings.prefeituraNome.toUpperCase(), width/2 - 150, 40, 14, true);
	drawText(settings.prefeituraEndereco.toUpperCase(), width/2 - 130, 55, 8);
	drawText(`CEP ${settings.prefeituraCep}`, width/2 - 40, 68, 8);
	drawLine(margin, 75, width - margin, 75, 1.5);
	
	drawText('ANEXO III - FORMULÁRIO DE PRESTAÇÃO DE CONTAS DE DIÁRIA DE', width/2 - 160, 90, 10, true);
	drawText('VIAGEM', width/2 - 20, 110, 10, true);

	// --- MAIN TABLE BOX ---
	const boxStart = 125;
	const boxWidth = width - (margin * 2);
	drawRect(margin, boxStart, boxWidth, 680);

	// Row: Prefeitura / Relatório / Exercício
	drawLine(margin, boxStart + 45, width - margin, boxStart + 45);
	drawLine(margin + 100, boxStart, margin + 100, boxStart + 45);
	drawLine(margin + 265, boxStart, margin + 265, boxStart + 45);
	
	drawText('Prefeitura', margin + 25, boxStart + 15, 8, true);
	drawText('Municipal de', margin + 20, boxStart + 25, 8, true);
	drawText('Lagoa dos Patos', margin + 15, boxStart + 35, 8, true);
	
	drawText('Relatório de Viagem', margin + 130, boxStart + 25, 12, true);
	
	drawText('Exercício', margin + 270, boxStart + 12, 8);
	drawText(request.exercicio.toString(), margin + 350, boxStart + 18, 10, true);
	drawLine(margin + 265, boxStart + 22, width - margin, boxStart + 22);
	drawText('Data:', margin + 270, boxStart + 35, 8);
	drawText(new Date(report.dataRelatorio).toLocaleDateString('pt-BR'), margin + 310, boxStart + 35, 10, true);

	// Personal Info
	const rowHeight = 25;
	let currentY = boxStart + 45;
	drawText(`Nome do Servidor: ${user.name}`, margin + 5, currentY + 15, 10);
	drawLine(margin + 350, currentY, margin + 350, currentY + rowHeight + 15);
	drawText(`Matrícula:`, margin + 355, currentY + 12, 8);
	drawText(user.matricula || '', margin + 355, currentY + 25, 10);
	currentY += rowHeight + 15;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Unidade Administrativa de Exercício:`, margin + 5, currentY + 10, 8);
	drawText(user.unidadeAdministrativa || '', margin + 5, currentY + 22, 10, true);
	drawLine(margin + 300, currentY, margin + 300, currentY + 35);
	drawText(`CPF:`, margin + 305, currentY + 10, 8);
	drawText(user.cpf || '', margin + 305, currentY + 22, 10, true);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Cargo Municipal: ${user.cargo}`, margin + 5, currentY + 15, 10);
	drawLine(margin + 300, currentY, margin + 300, currentY + rowHeight + 10);
	drawText(`Quantidades de Pernoites:`, margin + 305, currentY + 10, 8);
	drawText(report.quantidadePernoites.toString(), margin + 370, currentY + 25, 12, true);
	currentY += rowHeight + 10;
	drawLine(margin, currentY, width - margin, currentY);

	// Partida e Chegada
	const departure = new Date(report.dataHoraPartida);
	const arrival = new Date(report.dataHoraChegada);
	
	drawText(`Dia e Horário de Partida:${departure.toLocaleDateString('pt-BR')}`, margin + 5, currentY + 15, 10);
	drawText(`Horário: ${departure.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}hs`, margin + 70, currentY + 35, 10);
	
	drawLine(margin + 215, currentY, margin + 215, currentY + 55);
	
	drawText(`Dia e Horário de Chegada: ${arrival.toLocaleDateString('pt-BR')}`, margin + 225, currentY + 15, 10);
	drawText(`Horário:${arrival.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} hrs`, margin + 300, currentY + 45, 10);
	currentY += 55;
	drawLine(margin, currentY, width - margin, currentY);

	// Destino
	drawText('Cidade de destino/UF - ' + (request.destinoCidadeUf || '').toUpperCase(), width/2 - 120, currentY + 18, 11, true);
	currentY += 30;
	drawLine(margin, currentY, width - margin, currentY);

	// Relatório
	drawText('Relatório pormenorizado de viagem (especificar locais onde o servidor esteve ou executou', margin + 5, currentY + 12, 9, true);
	drawText('serviços:', margin + 5, currentY + 22, 9, true);
	
	const reportText = report.relatorioDetalhado || '';
	const lines = reportText.split('\n');
	lines.forEach((line, i) => {
		if (i < 12) drawText(line, margin + 5, currentY + 38 + (i * 12), 9);
	});
	currentY += 140;
	drawLine(margin, currentY, width - margin, currentY);

	// Declaração
	drawText('Declaração de Inexistência de Residência Própria no Local de Destino', width/2 - 150, currentY + 18, 10, true);
	drawLine(margin, currentY + 30, width - margin, currentY + 30);
	
	const declText = [
		'Declaro, para os devidos fins e especialmente para a devida e escorreita prestação de contas',
		'de diárias de viagem, junto ao Município de Lagoa dos Patos/MG, que não possuo residência',
		'própria na cidade para qual me desloquei e que consta neste relatório, por ser esta fiel',
		'expressão da verdade, assino a presente declaração, ciente de que a falsidade das',
		'informações acima está sujeita as penalidades legais previstas no Artigo 312 e seguintes do',
		'Código Penal, como também poderá implicar na perda do cargo público ocupado pelo',
		'servidor em questão.'
	];
	declText.forEach((line, i) => {
		drawText(line, margin + 5, currentY + 45 + (i * 12), 9);
	});
	currentY += 135;
	drawLine(margin, currentY, width - margin, currentY);

	// Checklist
	drawText('Documentos anexados:', margin + 5, currentY + 15, 10);
	const checklist = [
		{ label: '1- Comprovantes originais de passagem:', val: report.anexoPassagens },
		{ label: '2- Entrega dos cartões de embarque:', val: report.anexoCartoesEmbarque },
		{ label: '3- Cópia de autorização para circulação do veículo:', val: report.anexoAutorizacaoVeiculo },
		{ label: '4- Comprovante de participação no compromisso da viagem:', val: report.anexoComprovanteParticipacao }
	];
	
	checklist.forEach((item, i) => {
		drawText(`${item.label} sim ( ${item.val ? 'x' : ' '} ) não ( ${!item.val ? 'x' : ' '} )`, margin + 5, currentY + 35 + (i * 12), 9);
	});
	currentY += 95;
	drawLine(margin, currentY, width - margin, currentY);

	// Footer
	drawText('Por ser esta expressão da verdade firmo a presente declaração:', width/2 - 120, currentY + 40, 9);
	drawText(`Lagoa dos Patos-MG, ${new Date(report.dataRelatorio).toLocaleDateString('pt-BR')}.`, margin + 10, currentY + 55, 9);
	
	drawLine(width/2 - 100, currentY + 90, width/2 + 100, currentY + 90);
	drawText('Assinatura Servidor Público', width/2 - 60, currentY + 105, 10);

	// Footer Data de Impressão
	drawText(`Impresso em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, margin, 810, 7);

	return await pdfDoc.save();
}

export async function generateAnexoIV(request: Request, user: User, settings: Settings, report: Report) {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595.28, 841.89]); // A4
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	const { width, height } = page.getSize();
	const margin = 40;

	const drawText = (text: string, x: number, y: number, size = 9, isBold = false) => {
		page.drawText(text || '', {
			x,
			y: height - y,
			size,
			font: isBold ? fontBold : font,
			color: rgb(0, 0, 0),
		});
	};

	const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 1) => {
		page.drawLine({
			start: { x: x1, y: height - y1 },
			end: { x: x2, y: height - y2 },
			thickness,
			color: rgb(0, 0, 0),
		});
	};

	const drawRect = (x: number, y: number, w: number, h: number, thickness = 1, fill = false) => {
		page.drawRectangle({
			x,
			y: height - y - h,
			width: w,
			height: h,
			borderWidth: thickness,
			borderColor: rgb(0, 0, 0),
			color: fill ? rgb(0.85, 0.92, 0.83) : undefined, // Soft green/gray fill
		});
	};

	// --- HEADER ---
	if (settings.logoUrl) {
		try {
			const logoBytes = await fetch(settings.logoUrl).then(res => res.arrayBuffer());
			let logoImage;
			if (settings.logoUrl.toLowerCase().endsWith('.png')) {
				logoImage = await pdfDoc.embedPng(logoBytes);
			} else {
				logoImage = await pdfDoc.embedJpg(logoBytes);
			}
			page.drawImage(logoImage, {
				x: margin + 10,
				y: height - 70,
				width: 50,
				height: 50,
			});
		} catch (e) {
			console.error('Error embedding logo Anexo IV:', e);
		}
	}

	drawText(settings.prefeituraNome.toUpperCase(), width/2 - 150, 40, 14, true);
	drawText(settings.prefeituraEndereco.toUpperCase(), width/2 - 130, 55, 8);
	drawText(`CEP ${settings.prefeituraCep}`, width/2 - 40, 68, 8);
	drawLine(margin, 75, width - margin, 75, 1.5);

	// --- MAIN TABLE BOX ---
	const boxStart = 90;
	const boxWidth = width - (margin * 2);
	drawRect(margin, boxStart, boxWidth, 680);

	// Header Green Row
	drawRect(margin, boxStart, boxWidth, 25, 1, true);
	drawText('Servidor/Agente Político', width/2 - 60, boxStart + 18, 11, true);

	// Personal Info
	const rowHeight = 25;
	let currentY = boxStart + 25;
	drawText(`Nome: ${user.name}`, margin + 5, currentY + 15, 10);
	drawLine(margin + 350, currentY, margin + 350, currentY + rowHeight + 15);
	drawText(`Matrícula:`, margin + 355, currentY + 12, 8);
	drawText(user.matricula || '', margin + 355, currentY + 25, 10);
	currentY += rowHeight + 15;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Unidade Administrativa de Exercício: ${user.unidadeAdministrativa || ''}`, margin + 5, currentY + 22, 10);
	drawLine(margin + 350, currentY, margin + 350, currentY + 35);
	drawText(`CPF:`, margin + 355, currentY + 10, 8);
	drawText(user.cpf || '', margin + 355, currentY + 22, 10, true);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	drawText(`Cargo Municipal:`, margin + 5, currentY + 12, 8);
	drawText(user.cargo || '', margin + 5, currentY + 25, 10, true);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	// Parecer Header
	drawRect(margin, currentY, boxWidth, 35, 1, true);
	drawText('Parecer Do Responsável Pela Aprovação', width/2 - 110, currentY + 22, 12, true);
	currentY += 35;
	drawLine(margin, currentY, width - margin, currentY);

	// Contabilidade Row
	const contabData = report.contabilidadeData ? new Date(report.contabilidadeData).toLocaleDateString('pt-BR') : '__/__/____';
	drawText(`CONTABILIDADE - DATA: ${contabData}`, margin + 5, currentY + 25, 10);
	currentY += 45;
	drawLine(margin, currentY, width - margin, currentY);

	// Parecer Content
	drawText(report.contabilidadeParecer || '', margin + 10, currentY + 30, 10);
	currentY += 215;
	drawLine(margin, currentY, width - margin, currentY);

	// Contabilidade Signature Line
	drawText('ASS:  CONTAS CONTABILIDADE E CONSULTORIA LTDA          CRC/MG: 007309/O-2', margin + 10, currentY - 60, 9, true);
	drawText('CONTADOR', margin + 70, currentY - 50, 9, true);

	// Homologação Header
	drawRect(margin, currentY, boxWidth, 25, 1, true);
	drawText('HOMOLOGAÇÃO', width/2 - 40, currentY + 18, 11, true);
	currentY += 25;
	drawLine(margin, currentY, width - margin, currentY);

	// Result
	const isAprov = report.homologacaoStatus === 'APROVADA';
	const isReprov = report.homologacaoStatus === 'REPROVADA';
	drawText(`FICA,          ( ${isAprov ? 'x' : ' '} ) APROVADA   ( ${isReprov ? 'x' : ' '} ) REPROVADA`, width/2 - 150, currentY + 25, 11);
	currentY += 45;

	// Homologation Text
	const homText = [
		'ESTA PRESTAÇÃO DE CONTAS NOS TERMOS DOS PARECERES ACIMA E DE',
		'ACORDO COM O DISPOSTO NESTA LEI Nº 766/2017 E DECRETO',
		'MUNICIPAL 32/2019.'
	];
	homText.forEach((line, i) => {
		drawText(line, width/2 - 180, currentY + (i * 15), 10, true);
	});
	currentY += 60;

	// Final Footer
	const homData = report.homologacaoData ? new Date(report.homologacaoData).toLocaleDateString('pt-BR') : '__/__/____';
	drawText(`${settings.prefeituraNome.split(' ')[2] || 'Cidade'} – MG, ${homData}`, margin + 10, currentY + 10, 10, true);
	
	const sigX = width - margin - 180;
	drawLine(sigX, currentY + 50, sigX + 170, currentY + 50);
	if (settings.prefeitoNome) {
		drawText(settings.prefeitoNome.toUpperCase(), sigX + 10, currentY + 65, 9, true);
		drawText('PREFEITO MUNICIPAL', sigX + 35, currentY + 75, 8);
	} else {
		drawText('PREFEITO MUNICIPAL', sigX + 35, currentY + 65, 10, true);
	}

	// Footer Data de Impressão
	drawText(`Impresso em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, margin, 810, 7);

	return await pdfDoc.save();
}
