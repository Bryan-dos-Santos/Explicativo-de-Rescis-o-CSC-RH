document.addEventListener("DOMContentLoaded", () => {
    
    // Dicionário de Conceitos e Regras de Cálculo dos Eventos CLT / CSC RH
    const DICIONARIO_VERBAS = {
        "0001": {
            conceito: "Refere-se aos dias efetivamente trabalhados no mês do desligamento, proporcional até a data de demissão.",
            calculo: "Calculado dividindo o Salário Base por 30 (ou dias do mês) e multiplicando pelo número de dias trabalhados no mês da rescisão."
        },
        "0113": {
            conceito: "Desconto obrigatório da Previdência Social (INSS) incidente sobre os proventos tributáveis da rescisão.",
            calculo: "Aplica-se a tabela progressiva oficial do INSS sobre o total de proventos tributáveis apurados no acerto."
        },
        "4313": {
            conceito: "Desconto referente à coparticipação ou ao custo do benefício de alimentação/restaurante fornecido no período, conforme regramento interno ou PAT.",
            calculo: "Apurado proporcionalmente aos dias de utilização no mês ou conforme valor fixo mensal de coparticipação estipulado no acordo coletivo/empresa."
        },
        "9254": {
            conceito: "Ajuste referente a saldo devedor de horas no banco de horas ou faltas/atrasos não compensados até o desligamento.",
            calculo: "Calculado convertendo a quantidade de horas negativas pendentes com base no valor da hora normal de trabalho do colaborador."
        },
        "4100": {
            conceito: "Ajuste operacional de escala/ponto referente a dias computados para acerto em escala do mês posterior.",
            calculo: "Lançamento de ajuste de dias ou turnos conforme o encerramento da escala de trabalho do ponto."
        },
        "1788": {
            conceito: "Informativo/Dedução da base de cálculo do Imposto de Renda Retido na Fonte (IRRF) relativa à contribuição do INSS.",
            calculo: "O valor do INSS retido é abatido da base de cálculo bruta para fins de apuração da alíquota correta do Imposto de Renda."
        },
        "1658": {
            conceito: "Informativo do saldo atual da conta vinculada do FGTS do colaborador junto à Caixa Econômica Federal.",
            calculo: "Valor demonstrativo obtido no extrato para fins de apuração da multa rescisória (quando aplicável)."
        },
        "1655": {
            conceito: "Depósito do FGTS incidente sobre as verbas rescisórias tributáveis (Salário, Aviso Prévio, 13º proporcional).",
            calculo: "Aplica-se o percentual de 8% (ou 2% para Aprendizes) sobre a soma dos proventos rescisórios com incidência de FGTS."
        },
        "0133": {
            conceito: "Valor total líquido a ser depositado na conta bancária do colaborador após somar todos os proventos e subtrair os descontos.",
            calculo: "Total de Proventos (-) Total de Descontos."
        }
    };

    function decodeBase64Utf8(b64) {
        try {
            b64 = decodeURIComponent(b64);
            const binaryString = atob(b64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return new TextDecoder("utf-8").decode(bytes);
        } catch (e) {
            console.error("Erro na decodificação Base64:", e);
            return null;
        }
    }

    function formatarData(dataIso) {
        if (!dataIso) return "";
        const partes = dataIso.split("-");
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return dataIso;
    }

    function capitalizarPrimeiraLetra(texto) {
        if (!texto) return "";
        const txtMin = texto.toLowerCase();
        return txtMin.charAt(0).toUpperCase() + txtMin.slice(1);
    }

    function carregarDados() {
        const hash = window.location.hash.substring(1);
        if (!hash) {
            alert("Nenhum dado encontrado na URL.");
            return;
        }

        const jsonString = decodeBase64Utf8(hash);
        if (!jsonString) {
            alert("Erro ao ler os dados codificados.");
            return;
        }

        try {
            const dados = JSON.parse(jsonString);

            // Preenche dados cadastrais do colaborador
            document.getElementById("lblChapa").innerText = dados.c || "---";
            document.getElementById("lblNome").innerText = dados.n || "---";
            document.getElementById("lblTipo").innerText = dados.t || "---";
            
            const adm = formatarData(dados.adm);
            const dem = formatarData(dados.dem);
            
            document.getElementById("lblPeriodo").innerText = `${adm} a ${dem}`;
            
            const elemDesligamento = document.getElementById("lblDesligamento");
            if (elemDesligamento) {
                elemDesligamento.innerText = dem;
            }

            // Filtra e ordena do menor para o maior com base no código da verba (cod)
            const proventos = dados.v ? dados.v.filter(item => item.tp === 'P').sort((a, b) => parseInt(a.cod) - parseInt(b.cod)) : [];
            const descontos = dados.v ? dados.v.filter(item => item.tp === 'D').sort((a, b) => parseInt(a.cod) - parseInt(b.cod)) : [];

            let totalProventos = 0;
            let totalDescontos = 0;
            let htmlVerbas = '';

            // Renderiza Proventos Ordenados
            if (proventos.length > 0) {
                htmlVerbas += `
                    <div style="margin-top: 10px; margin-bottom: 2px;">
                        <h3 style="color: #2e7d32; font-size: 0.92rem; font-weight: bold; border-bottom: 2px solid #f2f2f2; padding-bottom: 2px; margin: 0 0 2px 0;">
                            Proventos
                        </h3>
                    </div>
                `;
                proventos.forEach((verba, index) => {
                    totalProventos += Number(verba.val) || 0;
                    const valFormatado = verba.val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const isLast = (index === proventos.length - 1);
                    const cssClass = isLast ? "verba-row last-item" : "verba-row";

                    htmlVerbas += `
                        <div class="${cssClass}">
                            <span style="font-weight: 600; color: #1e293b; font-size: 0.82rem;">${verba.nome}</span>
                            <span style="color: #2e7d32; font-weight: 700; font-size: 0.86rem;">R$ ${valFormatado}</span>
                        </div>
                    `;
                });
                const totalProventosFormatado = totalProventos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                htmlVerbas += `
                    <div class="verba-total-row">
                        <span style="font-weight: 700; color: #2e7d32; font-size: 0.85rem;">${capitalizarPrimeiraLetra("Total proventos")}</span>
                        <span style="color: #2e7d32; font-weight: 700; font-size: 0.9rem;">R$ ${totalProventosFormatado}</span>
                    </div>
                `;
            }

            // Renderiza Descontos Ordenados
            if (descontos.length > 0) {
                htmlVerbas += `
                    <div style="margin-top: 15px; margin-bottom: 2px;">
                        <h3 style="color: #c62828; font-size: 0.92rem; font-weight: bold; border-bottom: 2px solid #f2f2f2; padding-bottom: 2px; margin: 0 0 2px 0;">
                            Descontos
                        </h3>
                    </div>
                `;
                descontos.forEach((verba, index) => {
                    totalDescontos += Number(verba.val) || 0;
                    const valFormatado = verba.val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const isLast = (index === descontos.length - 1);
                    const cssClass = isLast ? "verba-row last-item" : "verba-row";

                    htmlVerbas += `
                        <div class="${cssClass}">
                            <span style="font-weight: 600; color: #1e293b; font-size: 0.82rem;">${verba.nome}</span>
                            <span style="color: #c62828; font-weight: 700; font-size: 0.86rem;">R$ ${valFormatado}</span>
                        </div>
                    `;
                });
                const totalDescontosFormatado = totalDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                htmlVerbas += `
                    <div class="verba-total-row">
                        <span style="font-weight: 700; color: #c62828; font-size: 0.85rem;">${capitalizarPrimeiraLetra("Total descontos")}</span>
                        <span style="color: #c62828; font-weight: 700; font-size: 0.9rem;">R$ ${totalDescontosFormatado}</span>
                    </div>
                `;
            }

            // Cálculo do Líquido de Rescisão (Proventos - Descontos)
            const valorLiquido = totalProventos - totalDescontos;
            const valorLiquidoFormatado = valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            htmlVerbas += `
                <div class="verba-liquido-row">
                    <span style="font-weight: 700; color: #00379d; font-size: 0.9rem;">${capitalizarPrimeiraLetra("Líquido de rescisão")}</span>
                    <span style="color: #00379d; font-weight: 700; font-size: 0.95rem;">R$ ${valorLiquidoFormatado}</span>
                </div>
            `;

            const container = document.getElementById("listaVerbas");
            if (container) container.innerHTML = htmlVerbas;

            // Preenche o Dropdown de Seleção de Verbas
            const selectVerbas = document.getElementById("selectVerbas");
            if (selectVerbas && dados.v) {
                selectVerbas.innerHTML = `<option value="">-- Selecione uma verba do seu demonstrativo --</option>`;
                dados.v.forEach((verba, index) => {
                    const option = document.createElement("option");
                    option.value = index;
                    option.textContent = `${verba.nome} (R$ ${verba.val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`;
                    selectVerbas.appendChild(option);
                });

                // Evento ao alterar a verba selecionada
                selectVerbas.addEventListener("change", (e) => {
                    const idx = e.target.value;
                    const painel = document.getElementById("painelExplicacao");

                    if (!painel) return;

                    if (idx === "" || idx === null) {
                        painel.style.display = "none";
                        return;
                    }

                    const item = dados.v[idx];
                    const cod = item.cod;
                    const infoConceito = DICIONARIO_VERBAS[cod] || {
                        conceito: "Rubrica/Evento registrado na rescisão contratual conforme movimentações da folha de pagamento do período.",
                        calculo: "Apurado com base no histórico de eventos do ponto/folha de pagamento referente ao desligamento."
                    };

                    const valFormat = item.val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const tipoTexto = item.tp === 'P' ? "Provento (Valor a receber)" : "Desconto (Valor abatido)";

                    const expTitulo = document.getElementById("expTitulo");
                    const expConceito = document.getElementById("expConceito");
                    const expCalculo = document.getElementById("expCalculo");
                    const expValorExplicacao = document.getElementById("expValorExplicacao");

                    if (expTitulo) expTitulo.innerText = `${item.nome}`;
                    if (expConceito) expConceito.innerText = infoConceito.conceito;
                    if (expCalculo) expCalculo.innerText = infoConceito.calculo;
                    if (expValorExplicacao) expValorExplicacao.innerHTML = `<b>Valor Apurado na sua rescisão:</b> R$ ${valFormat} [${tipoTexto}]`;

                    painel.style.display = "block";
                });
            }

        } catch (e) {
            console.error("Erro ao processar JSON:", e);
            alert("Erro ao carregar o detalhamento das verbas.");
        }
    }

    carregarDados();
});