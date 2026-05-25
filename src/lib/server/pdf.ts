import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { dailyRequests, user, settings, accountabilityReports } from './db/schema';
import  {formatCpf, formatPhone}  from '$lib/functions/all';
import extenso from 'extenso';

type Request = typeof dailyRequests.$inferSelect;
type User = typeof user.$inferSelect;
type Settings = typeof settings.$inferSelect;
type Report = typeof accountabilityReports.$inferSelect;

function formatDate(dateData: Date | number | string | null | undefined): string {
    if (!dateData) return '___/___/_____';
    try {
        const d = new Date(dateData);
        if (isNaN(d.getTime())) return '___/___/_____';
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return '___/___/_____';
    }
}

export async function generateAnexoII(request: Request, user: User, settings: Settings) {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595.28, 841.89]); // A4
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    
	const { width, height } = page.getSize();
	const margin = 30; // Margins tighter to fit
	const xRight = width - margin;

    console.log(user);
	const drawText = (text: string, x: number, y: number, size = 9, isBold = false, isCentered = false) => {
		const usedFont = isBold ? fontBold : font;
		let drawX = x;
		if (isCentered) {
			const textWidth = usedFont.widthOfTextAtSize(text || '', size);
			drawX = x - (textWidth / 2);
		}
		page.drawText(text || '', {
			x: drawX,
			y: height - y,
			size,
			font: usedFont,
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
    
    const fillRect = (x: number, y: number, w: number, h: number) => {
        page.drawRectangle({
			x,
			y: height - y - h,
			width: w,
			height: h,
			color: rgb(0.92, 0.92, 0.92),
		});
    }

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
				x: margin + 30,
				y: height - 85,
				width: 60,
				height: 60,
			});
		} catch (e) {
			console.error('Error embedding logo Anexo II:', e);
		}
	}

	drawText(settings.prefeituraNome.toUpperCase(), width/2, 40, 14, true, true);
	drawText(settings.prefeituraEndereco.toUpperCase() + ` CEP ${settings.prefeituraCep}`, width/2, 53, 9, false, true);
	drawText(`CONTATO: (38) 3248-4578`, width/2, 63, 9, false, true);
	
	drawText('LEI NO. 766/2017 (Decreto no.32/2019)', width/2, 78, 10, true, true);
	drawText('ANEXO II - FORMULÁRIO DE SOLICITAÇÃO DE DIÁRIA', width/2, 90, 10, true, true);
	drawLine(width/2 - 145, 92, width/2 + 145, 92, 1);

	// --- MAIN TABLE ---
	const boxStart = 105;
	const boxWidth = xRight - margin;
	let currentY = boxStart;

	const iM = margin;
	const iR = xRight;

    const hLine = (y: number) => drawLine(iM, y, iR, y);
    const vLine = (x: number, y1: number, y2: number) => drawLine(x, y1, x, y2);

    // Row 1
    const r1H = 36;
    hLine(currentY);
    vLine(iM, currentY, currentY + r1H);
    vLine(iM + 90, currentY, currentY + r1H);
    vLine(iR - 130, currentY, currentY + r1H);
    vLine(iR, currentY, currentY + r1H);
    
    drawText('Prefeitura', iM + 45, currentY + 12, 8, true, true);
    drawText('Municipal de', iM + 45, currentY + 23, 8, true, true);
    drawText('Lagoa dos Patos', iM + 45, currentY + 34, 8, true, true);

    drawText('Solicitação de Diárias/Indenização/Passagem', (iM + 90 + iR - 130) / 2, currentY + 21, 11, true, true);

    drawText('Exercício:', iR - 125, currentY + 12, 10);
    const exStr = request.exercicio.toString();
    const exWidth = fontBold.widthOfTextAtSize(exStr, 10);
    drawText(exStr, iR - 5 - exWidth, currentY + 12, 10, true);

    drawLine(iR - 130, currentY + 18, iR, currentY + 18);

    drawText('Data:', iR - 125, currentY + 30, 10);
    const dataStr = formatDate(request.dataSolicitacao);
    const dataWidth = fontBold.widthOfTextAtSize(dataStr, 10);
    drawText(dataStr, iR - 5 - dataWidth, currentY + 30, 10, true);

    currentY += r1H;
    hLine(currentY);

    // Row 2 (Gray fill)
    const r2H = 18;
    fillRect(iM, currentY, boxWidth, r2H);
    vLine(iM, currentY, currentY + r2H);
    vLine(iR - 130, currentY, currentY + r2H);
    vLine(iR, currentY, currentY + r2H);
    
    drawText('Nome: ', iM + 5, currentY + 12, 10);
    drawText(user.name, iM + 40, currentY + 12, 10, true);
    drawText('Matrícula:', iR - 125, currentY + 12, 10);
    const matStr = user.matricula || '';
    const matWidth = fontBold.widthOfTextAtSize(matStr, 10);
    drawText(matStr, iR - 5 - matWidth, currentY + 12, 10, true);

    currentY += r2H;
    hLine(currentY);

    // Row 3
    const r3H = 18;
    vLine(iM, currentY, currentY + r3H);
    vLine(iR - 130, currentY, currentY + r3H);
    vLine(iR, currentY, currentY + r3H);
    const contadoCUnidade = user.unidadeAdministrativa.length
    drawText('Unidade / Secretaria: ', iM + 5, currentY + 12, contadoCUnidade > 40 ? 8 : 10);
    drawText((user.unidadeAdministrativa || '') + ' / ' + (user.secretariaOrgao || ''), iM + 110, currentY + 12,  contadoCUnidade > 20 ? 8 : 10, true);
    drawText('CPF:', iR - 125, currentY + 12, 10);
    const cpfStr = formatCpf(user.cpf || '');
    const cpfWidth = fontBold.widthOfTextAtSize(cpfStr, 10);
    drawText(cpfStr, iR - 5 - cpfWidth, currentY + 12, 10, true);

    currentY += r3H;
    hLine(currentY);

    // Row 4
    const r4H = 18;
    vLine(iM, currentY, currentY + r4H);
    vLine(iR - 130, currentY, currentY + r4H);
    vLine(iR, currentY, currentY + r4H);
    const contadoCCargo = user.cargo.length
    drawText('Cargo Municipal: ', iM + 5, currentY + 12, contadoCCargo > 40 ? 8 : 10);
    drawText(user.cargo || '', iM + 90, currentY + 12, contadoCCargo > 40 ? 8 : 10, true);
    drawText('Qtd de diárias: ', iR - 125, currentY + 12, 10);
    const qtdStr = `${request.quantidadeDiarias} (` + extenso(request.quantidadeDiarias.toString()) + `)`;
    const qtdWidth = fontBold.widthOfTextAtSize(qtdStr, 10);
    drawText(qtdStr, iR - 5 - qtdWidth, currentY + 12, 10, true);

    currentY += r4H;
    hLine(currentY);

    // Row 5 (Banco)
    const r5H = 26;
    vLine(iM, currentY, currentY + r5H);
    vLine(iM + 120, currentY, currentY + r5H);
    vLine(iM + 250, currentY, currentY + r5H);
    vLine(iR - 130, currentY, currentY + r5H);
    vLine(iR, currentY, currentY + r5H);
    const tamanhoNomeBanco = (user.bancoNome?.length || 0) > 15 ? 6 : 10;
    drawText('Nome do Banco', iM + 60, currentY + 10, 10, false, true);
    drawText(user.bancoNome || '', iM + 60, currentY + 22, tamanhoNomeBanco, true, true);

    drawText('Cód. Agência:', iM + 185, currentY + 10, 10, false, true);
    drawText(user.bancoAgenciaCod || '', iM + 185, currentY + 22, 10, true, true);

    drawText('Nº Agência', iM + 250 + (iR - 130 - (iM + 250))/2, currentY + 10, 10, false, true);
    drawText(user.bancoAgenciaNum || '', iM + 250 + (iR - 130 - (iM + 250))/2, currentY + 22, 10, true, true);
    const tConta = user.bancoTipoConta === 'Conta Corrente' ? 'CC' : 'PP';
    drawText(`Nº da Conta ${tConta}:`, iR - 65, currentY + 10, 10, false, true);
   
    drawText(user.bancoContaNum || '', iR - 65, currentY + 22, 10, true, true);

    currentY += r5H;
    hLine(currentY);

    // Row 6 (Tipo de Diária)
    const r6H = 18;
    vLine(iM, currentY, currentY + r6H);
    vLine(iR, currentY, currentY + r6H);
    
    drawText('Tipo de Diária:', iM + 5, currentY + 12, 10);
    const tipo = request.tipoDiaria;
    drawText('( ' + (tipo === 'Antecipadas' ? 'x' : ' ') + ' ) Antecipadas', iM + 120, currentY + 12, 10);
    drawText('( ' + (tipo === 'Vencidas' ? 'x' : ' ') + ' ) Vencidas', iM + 280, currentY + 12, 10);
    drawText('( ' + (tipo === 'Indenização' ? 'x' : ' ') + ' ) Indenização', iM + 420, currentY + 12, 10);

    currentY += r6H;
    hLine(currentY);

    // Row 7 (Viagens Previstas)
    const r7H = 18;
    fillRect(iM, currentY, boxWidth, r7H);
    vLine(iM, currentY, currentY + r7H);
    vLine(iR, currentY, currentY + r7H);

    drawText('Viagens Previstas Período:', iM + 5, currentY + 12, 10);
    drawText('Saída: ' + formatDate(request.dataSaida) + ' ' + (request.horaSaida || ''), iM + 140, currentY + 12, 10, true);
    drawText('Retorno: ' + formatDate(request.dataRetorno) + ' ' + (request.horaRetorno || ''), iM + 330, currentY + 12, 10, true);

    currentY += r7H;
    hLine(currentY);

    // Row 8 (Meio de Transporte)
    const r8H = 18;
    vLine(iM, currentY, currentY + r8H);
    vLine(iR, currentY, currentY + r8H);
    
    drawText('Meio de Transporte: ', iM + 5, currentY + 12, 10);
    drawText('Veículo Oficial:   Sim ( ' + (request.meioTransporte === 'Oficial' ? 'x' : ' ') + ' )   Não ( ' + (request.meioTransporte !== 'Oficial' ? 'x' : ' ') + ' )   Placa: ' + (request.veiculoOficialPlaca || ''), iM + 120, currentY + 12, 10);

    currentY += r8H;
    hLine(currentY);

    // Row 9 (Transporte Intermunicipal)
    const r9H = 18;
    vLine(iM, currentY, currentY + r9H);
    vLine(iR, currentY, currentY + r9H);

    drawText('Viagem em transporte Intermunicipal:   Avião ( ) Ônibus ( ) Van ( ) Outro ( )', iM + 5, currentY + 12, 10);

    currentY += r9H;
    hLine(currentY);

    // Row 10 (Cidade destino)
    const r10H = 18;
    vLine(iM, currentY, currentY + r10H);
    vLine(iR, currentY, currentY + r10H);

    drawText('Cidade de destino/UF – ' + (request.destinoCidadeUf || '').toUpperCase(), width/2, currentY + 13, 11, true, true);

    currentY += r10H;
    hLine(currentY);

    // Row 11 (Veículo particular)
    const r11H = 50;
    vLine(iM, currentY, currentY + r11H);
    vLine(iR, currentY, currentY + r11H);

    drawText('Viagem em Veículo particular:    ( ' + (request.veiculoParticular ? 'x' : ' ') + ' ) Sim, Justifique.  ( ' + (!request.veiculoParticular ? 'x' : ' ') + ' ) Não', iM + 5, currentY + 12, 10);
    drawText('Justificativa: ' + (request.justificativaVeiculoParticular || ''), iM + 5, currentY + 26, 10);

    drawText('Distância entre a sede do município e local de destino: ' + (request.distanciaIdaVolta ? (Number(request.distanciaIdaVolta) / 2) + 'km.' : '____') + '      Ida e Volta: ' + (request.distanciaIdaVolta || '____') + 'km', iM + 5, currentY + 45, 10, true);

    currentY += r11H;
    hLine(currentY);

    // Row 13 (Valor Indenização - Gray Fill)
    const r13H = 18;
    fillRect(iM, currentY, boxWidth, r13H);
    vLine(iM, currentY, currentY + r13H);
    vLine(iM + 230, currentY, currentY + r13H); 
    vLine(iR, currentY, currentY + r13H);

    drawText('Valor Indenização: R$ ' + Number(request.valorIndenizacaoKm || 0.8).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '/Km Rodado', iM + 5, currentY + 12, 10);
    const indenTotal = Number(request.distanciaIdaVolta || 0) * Number(request.valorIndenizacaoKm || 0.8);
    console.log(request);
    // console.log(Number(request.valorIndenizacaoKm));
    console.log(indenTotal);
    if(request.meioTransporte != "Oficial") {
        drawText('R$ ' + (indenTotal > 0 ? indenTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'), iM + 230 + (iR - (iM + 230))/2, currentY + 12, 10, true, true);
    } else {
        drawText(' ', iM + 230 + (iR - (iM + 230))/2, currentY + 12, 10, true, true);
    }
    currentY += r13H;
    hLine(currentY);

    // Row 14 (Dados veículo próprio)
    const r14H = 18;
    vLine(iM, currentY, currentY + r14H);
    vLine(iR, currentY, currentY + r14H);

    drawText('Dados veículo Próprio:   ' + (request.dadosVeiculoProprio || ''), iM + 5, currentY + 12, 10);

    currentY += r14H;
    hLine(currentY);

    // Row 15 (Objetivo)
    const r15H = 90;
    vLine(iM, currentY, currentY + r15H);
    vLine(iR, currentY, currentY + r15H);

    drawText('Objetivo da Viagem:', iM + 5, currentY + 12, 10);

	const maxWidth = boxWidth - 10;
	const rawLines = (request.objetivoViagem || '').split('\n');
	const linesObj: string[] = [];
	
	rawLines.forEach(rawLine => {
		const words = rawLine.split(' ');
		let currentLine = words[0] || '';
		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const textWidth = font.widthOfTextAtSize(currentLine + ' ' + word, 10);
			if (textWidth < maxWidth) {
				currentLine += ' ' + word;
			} else {
				linesObj.push(currentLine);
				currentLine = word;
			}
		}
		if (currentLine || words.length === 1) { 
			linesObj.push(currentLine);
		}
	});

	let objY = currentY + 26;
	for (let i = 0; i < linesObj.length; i++) {
        if (objY > currentY + r15H - 10) break;
		drawText(linesObj[i], iM + 5, objY, 10);
        objY += 14;
	}

    currentY += r15H;
    hLine(currentY);

    // Row 16 (Despesas)
    // Headers (Gray fill)
    const r16H = 18;
    fillRect(iM, currentY, boxWidth, r16H);
    vLine(iM, currentY, currentY + r16H);
    vLine(iM + 170, currentY, currentY + r16H);
    vLine(iM + 390, currentY, currentY + r16H);
    vLine(iR, currentY, currentY + r16H);

    drawText('Despesas', iM + 85, currentY + 12, 10, false, true);
    drawText('Valor Solicitado', iM + 280, currentY + 12, 10, false, true);
    drawText('Valor Aprovado', iM + 460, currentY + 12, 10, false, true);

    currentY += r16H;
    hLine(currentY);

    // Items
    const items = [
        { label: `${request.quantidadeDiarias} Diárias`, req: request.valorDiariasSolicitado, apr: request.valorDiariasSolicitado },
        { label: 'Passagem', req: 0, apr: 0 },
        { label: 'Indenização - transporte', req: request.tipoDiaria === 'Indenização' ? request.valorTotalSolicitado : 0, apr: request.tipoDiaria === 'Indenização' ? request.valorTotalSolicitado : 0 }
    ];

    items.forEach(item => {
        vLine(iM, currentY, currentY + r16H);
        vLine(iM + 170, currentY, currentY + r16H);
        vLine(iM + 390, currentY, currentY + r16H);
        vLine(iR, currentY, currentY + r16H);

        drawText(item.label, iM + 85, currentY + 12, 10, false, true);
        if (item.req > 0) drawText('R$ ' + item.req.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), iM + 280, currentY + 12, 10, true, true);
        if (item.apr > 0) drawText('R$ ' + item.apr.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), iM + 460, currentY + 12, 10, true, true);

        currentY += r16H;
        hLine(currentY);
    });

    // Total (Gray fill)
    fillRect(iM, currentY, boxWidth, r16H);
    vLine(iM, currentY, currentY + r16H);
    vLine(iM + 170, currentY, currentY + r16H);
    vLine(iM + 390, currentY, currentY + r16H);
    vLine(iR, currentY, currentY + r16H);

    drawText('Total', iM + 85, currentY + 12, 10, false, true);
    drawText('R$ ' + request.valorTotalSolicitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), iM + 280, currentY + 12, 10, true, true);
    drawText('R$ ' + request.valorTotalSolicitado.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), iM + 460, currentY + 12, 10, true, true);

    currentY += r16H;
    hLine(currentY);

    // Below Table
    currentY += 15;
    drawText('Declaro que o valor recebido se refere ao pagamento para custeio de despesas em decorrência de', iM, currentY, 10);
    drawText('viagem a serviço da municipalidade, conforme demonstração supra, que deverei prestar contas nos', iM, currentY + 12, 10);
    drawText(`termos da ${settings.prefeituraLei || 'Lei Municipal no. 766, de 14.08.2017'}.`, iM, currentY + 24, 10, true);

    // Signatures Area
    currentY += 40;
    
    // Outer border for signatures box
    const sigBoxHeight = 130;
    drawRect(iM, currentY, boxWidth, sigBoxHeight + 20);

    drawText(`Local/Data: Lagoa dos Patos, ${new Date(request.dataSolicitacao).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })},`, iM + 15, currentY + 20, 10);
    
    drawText('Assinatura do Servidor/Assessor Jurídico – Procuradoria: _________________________________________', iM + 15, currentY + 50, 10);
    drawText(user.name?.toUpperCase() || '', iM + 270, currentY + 65, 9);

    drawText('(  ) Solicitação Deferida          (  ) Solicitação Indeferida', iM + 15, currentY + 85, 10);

    // Final Signatures
    drawLine(iM + 15, currentY + 115, iM + 200, currentY + 115);
    drawText('Nome secretario(a) de saúde', iM + 107, currentY + 127, 10, false, true);
    drawText('Secretário(a) de saúde', iM + 107, currentY + 139, 10, false, true);

    drawLine(iR - 200, currentY + 115, iR - 15, currentY + 115);
    drawText('Nome Prefeito Municipal de Lagoa', iR - 107, currentY + 127, 10, false, true);
    drawText('Prefeito Municipal', iR - 107, currentY + 139, 10, false, true);

	return Buffer.from(await pdfDoc.save());
}
export async function generateAnexoIII(request: Request, user: User, settings: Settings, report: Report) {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595.28, 841.89]); // A4
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	const { width, height } = page.getSize();
	const margin = 30;
    const xRight = width - margin;

	const drawText = (text: string, x: number, y: number, size = 9, isBold = false, isCentered = false) => {
		const usedFont = isBold ? fontBold : font;
		let drawX = x;
		if (isCentered) {
			const textWidth = usedFont.widthOfTextAtSize(text || '', size);
			drawX = x - (textWidth / 2);
		}
		page.drawText(text || '', {
			x: drawX,
			y: height - y,
			size,
			font: usedFont,
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

    const fillRect = (x: number, y: number, w: number, h: number) => {
        page.drawRectangle({
			x,
			y: height - y - h,
			width: w,
			height: h,
			color: rgb(0.92, 0.92, 0.92),
		});
    }

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
				x: margin + 30,
				y: height - 85,
				width: 60,
				height: 60,
			});
		} catch (e) {
			console.error('Error embedding logo Anexo III:', e);
		}
	}

	drawText(settings.prefeituraNome.toUpperCase(), width/2, 40, 14, true, true);
	drawText(settings.prefeituraEndereco.toUpperCase() + ` CEP ${settings.prefeituraCep}`, width/2, 53, 9, false, true);
	drawText(`CONTATO: (38) 3248-4578`, width/2, 63, 9, false, true);
	
	drawText('LEI NO. 766/2017 (Decreto no.32/2019)', width/2, 78, 10, true, true);
	drawText('ANEXO III - FORMULÁRIO DE PRESTAÇÃO DE CONTAS DE DIÁRIA DE VIAGEM', width/2, 90, 10, true, true);
	drawLine(width/2 - 200, 92, width/2 + 200, 92, 1);

	// --- MAIN TABLE BOX ---
	const boxStart = 105;
	const boxWidth = xRight - margin;
    let currentY = boxStart;

	const iM = margin;
	const iR = xRight;

    const hLine = (y: number) => drawLine(iM, y, iR, y);
    const vLine = (x: number, y1: number, y2: number) => drawLine(x, y1, x, y2);

    // Row 1
    const r1H = 36;
    hLine(currentY);
    vLine(iM, currentY, currentY + r1H);
    vLine(iM + 90, currentY, currentY + r1H);
    vLine(iR - 130, currentY, currentY + r1H);
    vLine(iR, currentY, currentY + r1H);
    
    drawText('Prefeitura', iM + 45, currentY + 12, 8, true, true);
    drawText('Municipal de Lagoa', iM + 45, currentY + 23, 8, true, true);
    drawText('dos Patos', iM + 45, currentY + 34, 8, true, true);

    drawText('Solicitação de', (iM + 90 + iR - 130) / 2, currentY + 15, 11, true, true);
    drawText('Diárias/Indenização/Passagem', (iM + 90 + iR - 130) / 2, currentY + 27, 11, true, true);

    drawText('Exercício:', iR - 125, currentY + 12, 10);
    const exStr = request.exercicio.toString();
    const exWidth = fontBold.widthOfTextAtSize(exStr, 10);
    drawText(exStr, iR - 5 - exWidth, currentY + 12, 10, true);

    drawLine(iR - 130, currentY + 18, iR, currentY + 18);

    drawText('Data:', iR - 125, currentY + 30, 10);
    const dataStr = formatDate(request.dataSolicitacao);
    const dataWidth = fontBold.widthOfTextAtSize(dataStr, 10);
    drawText(dataStr, iR - 5 - dataWidth, currentY + 30, 10, true);

    currentY += r1H;
    hLine(currentY);

    // Row 2 (Gray fill)
    const r2H = 18;
    fillRect(iM, currentY, boxWidth, r2H);
    vLine(iM, currentY, currentY + r2H);
    vLine(iR - 130, currentY, currentY + r2H);
    vLine(iR, currentY, currentY + r2H);
    
    drawText('Nome: ', iM + 5, currentY + 12, 10);
    drawText(user.name, iM + 40, currentY + 12, 10, true);
    drawText('Matrícula:', iR - 125, currentY + 12, 10);
    const matStr = user.matricula || '';
    const matWidth = fontBold.widthOfTextAtSize(matStr, 10);
    drawText(matStr, iR - 5 - matWidth, currentY + 12, 10, true);

    currentY += r2H;
    hLine(currentY);

    // Row 3
    const r3H = 18;
    vLine(iM, currentY, currentY + r3H);
    vLine(iR - 130, currentY, currentY + r3H);
    vLine(iR, currentY, currentY + r3H);
    const contadoCSecretaria = user.unidadeAdministrativa.length
    drawText('Unidade / Secretaria: ', iM + 5, currentY + 12, contadoCSecretaria > 40 ? 8 : 10);
    drawText((user.unidadeAdministrativa || '') + ' / ' + (user.secretariaOrgao || ''), iM + 110, currentY + 12, contadoCSecretaria > 40 ? 8 : 10, true);
    drawText('CPF:', iR - 125, currentY + 12, 10);
    const cpfStr = formatCpf(user.cpf || '');
    const cpfWidth = fontBold.widthOfTextAtSize(cpfStr, 10);
    drawText(cpfStr, iR - 5 - cpfWidth, currentY + 12, 10, true);

    currentY += r3H;
    hLine(currentY);

    // Row 4
    const r4H = 18;
    vLine(iM, currentY, currentY + r4H);
    vLine(iR - 130, currentY, currentY + r4H);
    vLine(iR, currentY, currentY + r4H);
    const contadoCCargo = user.cargo.length
    drawText('Cargo Municipal: ', iM + 5, currentY + 12, contadoCCargo > 40 ? 8 : 10);
    drawText(user.cargo || '', iM + 90, currentY + 12, contadoCCargo > 40 ? 8 : 10, true);
    drawText('Qtd de Pernoites: ', iR - 125, currentY + 12, 10);
    const pernoites = report.quantidadePernoites || 0;
    const qtdStr = `${pernoites} (` + extenso(pernoites.toString()) + `)`;
    const qtdWidth = fontBold.widthOfTextAtSize(qtdStr, 10);
    drawText(qtdStr, iR - 5 - qtdWidth, currentY + 12, 10, true);

    currentY += r4H;
    hLine(currentY);

    // Row 5 (Partida e Chegada - Gray fill)
    const r5H = 30;
    fillRect(iM, currentY, boxWidth, r5H);
    vLine(iM, currentY, currentY + r5H);
    vLine(width / 2, currentY, currentY + r5H);
    vLine(iR, currentY, currentY + r5H);

    const departure = new Date(report.dataHoraPartida);
	const arrival = new Date(report.dataHoraChegada);

    drawText('Dia e Horário de Partida: ', (iM + width/2)/2 - 50, currentY + 12, 10, false, true);
    drawText(departure.toLocaleDateString('pt-BR'), (iM + width/2)/2 + 40, currentY + 12, 10, true, true);
    drawText('Horário: ', (iM + width/2)/2 - 20, currentY + 24, 10, false, true);
    drawText(departure.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 'hs', (iM + width/2)/2 + 15, currentY + 24, 10, true, true);

    drawText('Dia e Horário de Chegada: ', (width/2 + iR)/2 - 50, currentY + 12, 10, false, true);
    drawText(arrival.toLocaleDateString('pt-BR'), (width/2 + iR)/2 + 40, currentY + 12, 10, true, true);
    drawText('Horário: ', (width/2 + iR)/2 - 20, currentY + 24, 10, false, true);
    drawText(arrival.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 'hs', (width/2 + iR)/2 + 15, currentY + 24, 10, true, true);

    currentY += r5H;
    hLine(currentY);

    // Row 6 (Destino)
    const r6H = 18;
    vLine(iM, currentY, currentY + r6H);
    vLine(iR, currentY, currentY + r6H);

    drawText('Cidade de destino/UF:', iM + 5,  currentY + 13, 11, false,false );
    drawText((request.destinoCidadeUf || '').toUpperCase(), width/2, currentY + 13, 11, true, true);


    currentY += r6H;
    hLine(currentY);

    // Row 7 (Relatório)
    const r7H = 180;
    vLine(iM, currentY, currentY + r7H);
    vLine(iR, currentY, currentY + r7H);

    drawText('Relatório pormenorizado de viagem (especificar locais onde o servidor esteve ou executou serviços):', iM + 5, currentY + 12, 10);
    
    const maxWidth = boxWidth - 10;
	const rawLines = (report.relatorioDetalhado || '').split('\n');
	const linesObj: string[] = [];
	
	rawLines.forEach(rawLine => {
		const words = rawLine.split(' ');
		let currentLine = words[0] || '';
		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const textWidth = fontBold.widthOfTextAtSize(currentLine + ' ' + word, 10);
			if (textWidth < maxWidth) {
				currentLine += ' ' + word;
			} else {
				linesObj.push(currentLine);
				currentLine = word;
			}
		}
		if (currentLine || words.length === 1) { 
			linesObj.push(currentLine);
		}
	});

	let objY = currentY + 26;
	for (let i = 0; i < linesObj.length; i++) {
        if (objY > currentY + r7H - 10) break;
		drawText(linesObj[i], iM + 5, objY, 10, true);
        objY += 14;
	}

    currentY += r7H;
    hLine(currentY);

    // Row 8 (Declaração - Gray fill)
    const r8H = 110;
    fillRect(iM, currentY, boxWidth, r8H);
    vLine(iM, currentY, currentY + r8H);
    vLine(iR, currentY, currentY + r8H);

    drawText('Declaração de Inexistência de Residência Própria no Local de Destino', iM + 5, currentY + 15, 11, true);

    const declText = [
		'Declaro, para os devidos fins e especialmente para a devida e escorreita prestação de contas de diárias',
		'de viagem, junto ao Município de Lagoa dos Patos/MG, que não possuo residência própria na cidade',
		'para qual me desloquei e que consta neste relatório, por ser esta fiel expressão da verdade, assino a',
		'presente declaração, ciente de que a falsidade das informações acima está sujeita as penalidades legais',
		'previstas no Artigo 312 e seguintes do Código Penal, como também poderá implicar na perda do cargo',
		'público ocupado pelo servidor em questão.'
	];
	declText.forEach((line, i) => {
		drawText(line, iM + 5, currentY + 35 + (i * 12), 10);
	});

    currentY += r8H;
    hLine(currentY);

    // Row 9 (Documentos anexados)
    const r9H = 80;
    vLine(iM, currentY, currentY + r9H);
    vLine(iR, currentY, currentY + r9H);

    drawText('Documentos anexados:', iM + 5, currentY + 15, 10);
    const checklist = [
		{ label: '1- Comprovantes originais de passagem:', val: report.anexoPassagens },
		{ label: '2- Entrega dos cartões de embarque:', val: report.anexoCartoesEmbarque },
		{ label: '3- Cópia de autorização para circulação do veículo:', val: report.anexoAutorizacaoVeiculo },
		{ label: '4- Comprovante de participação no compromisso da viagem:', val: report.anexoComprovanteParticipacao }
	];
	
	checklist.forEach((item, i) => {
		drawText(`${item.label} sim ( ${item.val ? 'x' : ' '} ) não ( ${!item.val ? 'x' : ' '} )`, iM + 5, currentY + 30 + (i * 12), 10);
	});

    currentY += r9H;
    hLine(currentY);

    // Final bottom area
    const bottomH = 150;
    vLine(iM, currentY, currentY + bottomH);
    vLine(iR, currentY, currentY + bottomH);

    drawText('Por ser esta expressão da verdade firmo a assinatura do servidor abaixo nesta presente', iM + 5, currentY + 20, 10);
    drawText('declaração:', iM + 5, currentY + 32, 10);

    const dataFinalStr = new Date(report.dataRelatorio).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' });
    drawText(`Lagoa dos Patos-MG, ${dataFinalStr}.`, iM + 5, currentY + 55, 10, true);

    drawLine(width/2 - 150, currentY + 115, width/2 + 150, currentY + 115);
    drawText(`${user.matricula} - ${user.name} - ${formatCpf(user.cpf || '')}`, width/2, currentY + 127, 10, true, true);

    currentY += bottomH;
    hLine(currentY);

	// Footer Data de Impressão
	// drawText(`Impresso em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, margin, 810, 7);

	return Buffer.from(await pdfDoc.save());
}
export async function generateAnexoIV(request: Request, user: User, settings: Settings, report: Report) {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595.28, 841.89]); // A4
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	const { width, height } = page.getSize();
	const margin = 30;
    const xRight = width - margin;

	const drawText = (text: string, x: number, y: number, size = 9, isBold = false, isCentered = false) => {
		const usedFont = isBold ? fontBold : font;
		let drawX = x;
		if (isCentered) {
			const textWidth = usedFont.widthOfTextAtSize(text || '', size);
			drawX = x - (textWidth / 2);
		}
		page.drawText(text || '', {
			x: drawX,
			y: height - y,
			size,
			font: usedFont,
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

    const fillRect = (x: number, y: number, w: number, h: number, colorArr: [number, number, number]) => {
        page.drawRectangle({
			x,
			y: height - y - h,
			width: w,
			height: h,
			color: rgb(...colorArr),
		});
    }

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
				x: margin + 30,
				y: height - 85,
				width: 60,
				height: 60,
			});
		} catch (e) {
			console.error('Error embedding logo Anexo IV:', e);
		}
	}

	drawText(settings.prefeituraNome.toUpperCase(), width/2, 40, 14, true, true);
	drawText(settings.prefeituraEndereco.toUpperCase() + ` CEP ${settings.prefeituraCep}`, width/2, 53, 9, false, true);
	drawText(`CONTATO: (38) 3248-4578`, width/2, 63, 9, false, true);
	
	drawText('LEI NO. 766/2017 (Decreto no.32/2019)', width/2, 78, 10, true, true);
	drawText('ANEXO IV - ANÁLISE DA PRESTAÇÃO DE CONTAS', width/2, 90, 10, true, true);
	drawLine(width/2 - 145, 92, width/2 + 145, 92, 1);

	// --- MAIN TABLE BOX ---
	const boxStart = 105;
	const boxWidth = xRight - margin;
    let currentY = boxStart;

	const iM = margin;
	const iR = xRight;
    const greenFill: [number, number, number] = [0.85, 0.92, 0.83];

    const hLine = (y: number) => drawLine(iM, y, iR, y);
    const vLine = (x: number, y1: number, y2: number) => drawLine(x, y1, x, y2);

    // Outer border frame actually spans multiple sections. 
    // Wait, the image has a double border around the entire table!
    // Let's draw an inner and outer box later. We'll track total height.

    // Row 1 (Header Green)
    const r1H = 22;
    fillRect(iM, currentY, boxWidth, r1H, greenFill);
    vLine(iM, currentY, currentY + r1H);
    vLine(iR, currentY, currentY + r1H);
    
    drawText('Servidor/Agente Político', width/2, currentY + 15, 11, true, true);

    currentY += r1H;
    hLine(currentY);

    // Row 2
    const r2H = 26;
    vLine(iM, currentY, currentY + r2H);
    vLine(iR - 130, currentY, currentY + r2H);
    vLine(iR, currentY, currentY + r2H);

    drawText('Nome: ', iM + 5, currentY + 16, 10);
    drawText(user.name, iM + 40, currentY + 16, 10, true);
    drawText('Matrícula:', iR - 125, currentY + 16, 10);
    const matStr = user.matricula || '';
    const matWidth = fontBold.widthOfTextAtSize(matStr, 10);
    drawText(matStr, iR - 5 - matWidth, currentY + 16, 10, true);

    currentY += r2H;
    hLine(currentY);

    // Row 3
    const r3H = 26;
    vLine(iM, currentY, currentY + r3H);
    vLine(iR - 130, currentY, currentY + r3H);
    vLine(iR, currentY, currentY + r3H);
    const contadoCUnidade = user.unidadeAdministrativa.length
    drawText('Unidade / Secretaria: ', iM + 5, currentY + 16, contadoCUnidade > 40 ? 8 : 10);
    drawText((user.unidadeAdministrativa || '') + ' / ' + (user.secretariaOrgao || ''), iM + 110, currentY + 16, contadoCUnidade > 40 ? 20 : 10, true);
    drawText('CPF:', iR - 125, currentY + 16, 10);
    const cpfStr = formatCpf(user.cpf || '');
    const cpfWidth = fontBold.widthOfTextAtSize(cpfStr, 10);
    drawText(cpfStr, iR - 5 - cpfWidth, currentY + 16, 10, true);

    currentY += r3H;
    hLine(currentY);

    // Row 4
    const r4H = 26;
    vLine(iM, currentY, currentY + r4H);
    vLine(iR, currentY, currentY + r4H);
    const contadoCCargo = user.cargo.length
    drawText('Cargo Municipal: ', iM + 5, currentY + 16, contadoCCargo > 40 ? 8 : 10);
    drawText(user.cargo || '', iM + 90, currentY + 16, contadoCCargo > 40 ? 8 : 10, true);

    currentY += r4H;
    hLine(currentY);

    // Row 5 (Header Parecer Green)
    const r5H = 30;
    fillRect(iM, currentY, boxWidth, r5H, greenFill);
    vLine(iM, currentY, currentY + r5H);
    vLine(iR, currentY, currentY + r5H);
    
    drawText('Parecer Do Responsável Pela Aprovação', width/2, currentY + 19, 11, true, true);

    currentY += r5H;
    hLine(currentY);

    // Row 6 (Contabilidade Date)
    const r6H = 35;
    vLine(iM, currentY, currentY + r6H);
    vLine(iR, currentY, currentY + r6H);

    const contabData = formatDate(report.contabilidadeData);
    drawText(`Lagoa dos Patos - MG   ${contabData}`, iM + 5, currentY + 22, 10);

    currentY += r6H;
    hLine(currentY);

    // Row 7 (Contabilidade Body & Signature)
    const r7H = 100;
    vLine(iM, currentY, currentY + r7H);
    vLine(iR, currentY, currentY + r7H);

    // Provide space for text/parecer if it exists, otherwise it's just signature space
    if (report.contabilidadeParecer) {
        drawText(report.contabilidadeParecer, iM + 10, currentY + 20, 10);
    }

    drawLine(width/2 - 150, currentY + r7H - 30, width/2 + 150, currentY + r7H - 30);
    drawText('ASS: CONTAS CONTABILIDADE E CONSULTORIA LTDA', width/2, currentY + r7H - 18, 10, true, true);
    drawText('CRC/MG: 007309/O-2', width/2, currentY + r7H - 6, 10, true, true);

    currentY += r7H;
    hLine(currentY);

    // Row 8 (Header Homologação Green)
    const r8H = 22;
    fillRect(iM, currentY, boxWidth, r8H, greenFill);
    vLine(iM, currentY, currentY + r8H);
    vLine(iR, currentY, currentY + r8H);
    
    drawText('HOMOLOGAÇÃO', width/2, currentY + 15, 11, true, true);

    currentY += r8H;
    hLine(currentY);

    // Row 9 (Homologação result and signature)
    const r9H = 150;
    vLine(iM, currentY, currentY + r9H);
    vLine(iR, currentY, currentY + r9H);

    const isAprov = report.homologacaoStatus?.toUpperCase() === 'APROVADA';
	const isReprov = report.homologacaoStatus?.toUpperCase() === 'REPROVADA';

    drawText(`FICA,            ( ${isAprov ? 'x' : ' '} ) APROVADA   ( ${isReprov ? 'x' : ' '} ) REPROVADA`, iM + 5, currentY + 20, 11);

    drawText('ESTA PRESTAÇÃO DE CONTAS NOS TERMOS DOS PARECERES ACIMA E DE ACORDO', width/2, currentY + 45, 10, false, true);
    drawText(`COM O DISPOSTO NESTA LEI Nº 766/2017 E DECRETO MUNICIPAL 32/2019.`, width/2, currentY + 57, 10, true, true);

    const homData = formatDate(report.homologacaoData);
    drawText(`Lagoa dos Patos - MG   ${homData}`, iM + 5, currentY + 80, 10, true);

    drawLine(width/2 - 120, currentY + 120, width/2 + 120, currentY + 120);
    if (settings.prefeitoNome) {
        drawText(settings.prefeitoNome.toUpperCase(), width/2, currentY + 132, 10, true, true);
        drawText('PREFEITO MUNICIPAL', width/2, currentY + 144, 10, true, true);
    } else {
        drawText('PREFEITO MUNICIPAL', width/2, currentY + 135, 10, true, true);
    }

    currentY += r9H;
    hLine(currentY);

    // Inner and Outer borders (double border effect)
    drawRect(margin, boxStart, boxWidth, currentY - boxStart);
    drawRect(margin - 2, boxStart - 2, boxWidth + 4, currentY - boxStart + 4);

	return Buffer.from(await pdfDoc.save());
}
