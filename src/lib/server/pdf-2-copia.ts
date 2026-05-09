import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { dailyRequests, user, settings, accountabilityReports } from './db/schema';
import  {formatCpf, formatPhone}  from '$lib/functions/all';
import extenso from 'extenso';

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
	const xRight = width - margin;

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

	drawText(settings.prefeituraNome.toUpperCase(), 120, 40, 14, true);
	drawText(settings.prefeituraEndereco.toUpperCase(), 150, 55, 8);
	drawText(`CEP ${settings.prefeituraCep}`, 260, 68, 8);
	drawLine(margin, 75, xRight, 75, 1);
	
	drawText('LEI NO. 766/2017 (Decreto no.32/2019)', 180, 90, 11, true);
	drawText('ANEXO II - FORMULÁRIO DE SOLICITAÇÃO DE DIÁRIA', 130, 105, 11, true);
	drawLine(130, 107, 455, 107, 1); // Underline

	// --- MAIN TABLE BOX ---
	const boxStart = 115;
	const boxWidth = xRight - margin;

	const iM = margin + 3; // inner margin left
	const iR = xRight - 3; // inner margin right
	const iT = boxStart + 3; // inner margin top

	// Row 1
	drawLine(180, iT, 180, boxStart + 45);
	drawLine(400, iT, 400, boxStart + 45);
	
	drawText('Prefeitura de Lagoa dos Patos MG'.toUpperCase(), 48, boxStart + 15, 6.5, false);
	drawText('COD:' + request.code.toString().padStart(4, '0'), 80, boxStart + 27, 8, true);
	drawText('SECRETARIA: ' + (user?.secretariaOrgao?.toUpperCase() || ''), 48, boxStart + 39, 8, true);
	
	drawText('Solicitação de', 255, boxStart + 20, 11, false);
	drawText('Diárias/Indenização/Passagem', 210, boxStart + 35, 11, false);
	
	drawLine(400, boxStart + 22, iR, boxStart + 22);
	drawText('Exercício:', 405, boxStart + 14, 10);
	drawText(request.exercicio.toString(), 460, boxStart + 18, 11, true);
	
	drawText('Data:', 405, boxStart + 36, 10);
	drawText(new Date(request.dataSolicitacao).toLocaleDateString('pt-BR'), 460, boxStart + 36, 11, true);

	drawLine(iM, boxStart + 45, iR, boxStart + 45);

	// Row 2
	let currentY = boxStart + 45; // 160
	drawLine(400, currentY, 400, currentY + 25);
	drawText('Nome: ', 45, currentY + 17, 10);
	drawText(user.name.toUpperCase(), 80, currentY + 17, 10, true);
	drawText('Matrícula: ' + (user.matricula || ''), 405, currentY + 17, 10, true);
	currentY += 25; // 185
	drawLine(iM, currentY, iR, currentY);

	// Row 3
	drawLine(400, currentY, 400, currentY + 25);
	drawText('Unidade Administrativa de Exercício:', 45, currentY + 17, 10);
	drawText(user.unidadeAdministrativa || '', 220, currentY + 17, 10, true);
	drawText('CPF:', 405, currentY + 17, 10);
	drawText(formatCpf(user.cpf || ''), 440, currentY + 17, 10, true);
	currentY += 25;
	drawLine(iM, currentY, iR, currentY);

	// Row 4
	drawLine(400, currentY, 400, currentY + 25);
	drawText('Cargo Municipal:', 45, currentY + 17, 10);
	drawText(user.cargo || '', 135, currentY + 17, 10, true);
	drawText('Quantidade diárias:', 410, currentY + 17, 10);
	drawText(`${request.quantidadeDiarias.toString()} ` + extenso(request.quantidadeDiarias.toString()), 515, currentY + 17, 10, true);
	currentY += 25; // 255
	drawLine(iM, currentY, iR, currentY);

	// Row 5
	drawLine(180, currentY, 180, currentY + 25);
	drawLine(290, currentY, 290, currentY + 25);
	drawLine(400, currentY, 400, currentY + 25);
	
	drawText('Banco:', 45, currentY + 17, 10);
	drawText(user.bancoNome || '', 85, currentY + 17, 10, true);
	
	drawText('Cód. Agência:', 185, currentY + 17, 10);
	drawText(user.bancoAgenciaCod || '', 255, currentY + 17, 10, true);
	
	drawText('Nº Agência:', 295, currentY + 17, 10);
	drawText(user.bancoAgenciaNum || '', 360, currentY + 17, 10, true);
	
	drawText('Nº da Conta PP:', 405, currentY + 17, 10);
	drawText(user.bancoContaNum || '', 490, currentY + 17, 10, true);
	currentY += 25; // 290
	drawLine(iM, currentY, iR, currentY);

	// Row 6
	drawText('Tipo de Diária:', 45, currentY + 17, 10);
	const tipo = request.tipoDiaria;
	drawText('( ' + (tipo === 'Antecipadas' ? 'x' : ' ') + ' ) Antecipadas', 130, currentY + 17, 10);
	drawText('( ' + (tipo === 'Vencidas' ? 'x' : ' ') + ' ) Vencidas', 250, currentY + 17, 10);
	drawText('( ' + (tipo === 'Indenização' ? 'x' : ' ') + ' ) Indenização', 370, currentY + 17, 10);
	currentY += 25; // 325
	drawLine(iM, currentY, iR, currentY);

	// Row 7
	drawText('Viagens Previstas Período:', 45, currentY + 17, 10);
	drawText('Saída: ' + new Date(request.dataSaida).toLocaleDateString('pt-BR'), 200, currentY + 17, 10, true);
	drawText('Retorno: ' + new Date(request.dataRetorno).toLocaleDateString('pt-BR'), 330, currentY + 17, 10, true);
	currentY += 25; // 360
	drawLine(iM, currentY, iR, currentY);

	// Row 8
	drawText('Meio de Transporte: ', 45, currentY + 17, 10, true);
	drawText('Veículo Oficial:  Sim ( ' + (request.meioTransporte === 'Oficial' ? 'x' : ' ') + ' )  Não ( ' + (request.meioTransporte !== 'Oficial' ? 'x' : ' ') + ' )  Placa: ' + (request.veiculoOficialPlaca || '_______'), 170, currentY + 17, 10);
	currentY += 25;
	drawLine(iM, currentY, iR, currentY);
	
	drawText('Viagem em transporte Intermunicipal:  Avião ( ) Ônibus ( ) Outro ( ) Van', 45, currentY + 17, 10);
	currentY += 25; // 415
	drawLine(iM, currentY, iR, currentY);

	// Row 9
	drawText('Cidade de destino/UF - ' + (request.destinoCidadeUf || '').toUpperCase(), 160, currentY + 17, 11, true);
	currentY += 25; // 440
	drawLine(iM, currentY, iR, currentY);

	// Row 10
	drawLine(350, currentY, 350, currentY + 25);
	drawText('Veículo particular: ( ' + (request.veiculoParticular ? 'x' : ' ') + ' ) Sim, Just. ( ' + (!request.veiculoParticular ? 'x' : ' ') + ' ) Não', 45, currentY + 17, 10);
	drawText('Justificativa: ' + (request.justificativaVeiculoParticular || ''), 360, currentY + 17, 10);
	currentY += 25;
	drawLine(iM, currentY, iR, currentY);

	drawText('Distância entre a sede do município e local de destino de Ida e Volta:', 45, currentY + 17, 10);
	drawText((request.distanciaIdaVolta || '') + ' KM', 420, currentY + 17, 10, true);
	currentY += 25; // 495
	drawLine(iM, currentY, iR, currentY);

	// Row 11 & 12
	drawLine(260, currentY, 260, currentY + 25);
	drawText('Valor Indenização: R$ ' + Number(request.valorIndenizacaoKm || 0.8).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '/Km Rodado', 45, currentY + 17, 10);
	drawText('Dados veículo Próprio: ' + (request.dadosVeiculoProprio || ''), 265, currentY + 17, 10);
	currentY += 25; // 520
	drawLine(iM, currentY, iR, currentY);

	// Row 13 - Objetivo da Viagem (Quebra de Linha)
	drawText('Objetivo da Viagem:', 45, currentY + 17, 10, true);
	const labelWidth = fontBold.widthOfTextAtSize('Objetivo da Viagem: ', 10);
	
	const maxWidthFirstLine = boxWidth - 20 - labelWidth;
	const maxWidthOtherLines = boxWidth - 20;

	const rawLines = (request.objetivoViagem || '-').split('\n');
	const linesObj: string[] = [];
	let isFirstLine = true;
	
	rawLines.forEach(rawLine => {
		const words = rawLine.split(' ');
		let currentLine = words[0] || '';
		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const width = font.widthOfTextAtSize(currentLine + ' ' + word, 10);
			const max = isFirstLine ? maxWidthFirstLine : maxWidthOtherLines;
			if (width < max) {
				currentLine += ' ' + word;
			} else {
				linesObj.push(currentLine);
				currentLine = word;
				isFirstLine = false;
			}
		}
		if (currentLine || words.length === 1) { 
			linesObj.push(currentLine);
			isFirstLine = false;
		}
	});

	let objY = currentY + 17;
	drawText(linesObj[0] || '', 45 + labelWidth, objY, 10);
	
	for (let i = 1; i < linesObj.length; i++) {
		objY += 15;
		drawText(linesObj[i], 45, objY, 10);
	}
	
	currentY = Math.max(currentY + 25, objY + 10);
	drawLine(iM, currentY, iR, currentY);

	// Row 14 - Despesas Header
	drawLine(230, currentY, 230, currentY + 105);
	drawLine(410, currentY, 410, currentY + 105);
	drawText('Despesas', 110, currentY + 17, 10);
	drawText('Valor Solicitado', 280, currentY + 17, 10);
	drawText('Valor', 465, currentY + 12, 10);
	drawText('Aprovado', 455, currentY + 22, 10);
	currentY += 25; // 595
	drawLine(iM, currentY, iR, currentY);

	// Row 15
	drawText(request.quantidadeDiarias + ' Diárias', 110, currentY + 15, 10);
	drawText('R$ ' + request.valorDiariasSolicitado.toFixed(2).replace('.', ','), 290, currentY + 15, 10, true);
	drawText('R$ ' + request.valorDiariasSolicitado.toFixed(2).replace('.', ','), 445, currentY + 15, 10, true);
	currentY += 20; // 615
	drawLine(iM, currentY, iR, currentY);

	// Row 16
	drawText('Passagem', 110, currentY + 15, 10);
	currentY += 20; // 635
	drawLine(iM, currentY, iR, currentY);

	// Row 17
	drawText('Indenização - transporte', 70, currentY + 15, 10);
	currentY += 20; // 655
	drawLine(iM, currentY, iR, currentY);

	// Row 18
	drawText('Total', 120, currentY + 15, 10);
	drawText('R$ ' + request.valorTotalSolicitado.toFixed(2).replace('.', ','), 290, currentY + 15, 10, true);
	drawText('R$ ' + request.valorTotalSolicitado.toFixed(2).replace('.', ','), 445, currentY + 15, 10, true);
	currentY += 20; // 675
	
	// End of table outer box, draw the dynamic outer border now
	const tableHeight = currentY - boxStart;
	drawRect(margin, boxStart, boxWidth, tableHeight);
	drawRect(margin + 3, boxStart + 3, boxWidth - 6, tableHeight - 6);

	// Below Table Text
	currentY += 15; // 690
	drawText('Declaro que o valor recebido refere-se ao pagamento para custeio de despesas em decorrência de viagem a serviço ', 40, currentY, 10);
	drawText('da municipalidade, conforme demonstração supra, que deverei prestar contas nos termos da Lei Municipal.', 40, currentY + 15, 10);
	drawText(settings.prefeituraLei || '', 40, currentY + 30, 10);

	// Signatures Box
	currentY += 45; // 735
	drawRect(margin, currentY - 5, boxWidth, 125);
	drawText('Local/Data: Lagoa dos Patos, ' + new Date(request.dataSolicitacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) + ',', 45, currentY + 10, 10);
	drawText('Assinatura do Servidor/Assessor Jurídico – Procuradoria: _________________________________________', 45, currentY + 35, 10);
	drawText('(  ) Solicitação Deferida     (  ) Solicitação Indeferida', 45, currentY + 60, 10);

	drawText(user.name?.toUpperCase() || '', 300, currentY + 50, 8);

	drawLine(50, currentY + 95, 200, currentY + 95);
	drawText('Secretário(a) Municipal', 75, currentY + 105, 10);
	drawText(' ', 100, currentY + 105, 10);

	drawLine(350, currentY + 95, 530, currentY + 95);
	drawText(settings.prefeitoNome?.toUpperCase() || '', 365, currentY + 105, 8);
	drawText('Prefeito Municipal', 410, currentY + 115, 8);

	// Footer
	// drawText('LEI NO. 766/2017 (Decreto no.32/2019)', 180, 835, 11, true);

	return Buffer.from(await pdfDoc.save());
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
