document.addEventListener("DOMContentLoaded", () => {

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

    function formatarNomeCompleto(str) {
        if (!str) return "---";
        const ignorar = ["de", "da", "do", "das", "dos", "e"];
        return str.toLowerCase().split(" ").map(palavra => {
            if (!palavra) return "";
            if (ignorar.includes(palavra)) return palavra;
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        }).join(" ");
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

            // Preenche dados cadastrais
            document.getElementById("lblChapa").innerText = dados.c || "---";
            document.getElementById("lblNome").innerText = formatarNomeCompleto(dados.n);
            
            const elemFilial = document.getElementById("lblFilial");
            if (elemFilial) elemFilial.innerText = dados.f || "---";

            document.getElementById("lblTipo").innerText = capitalizarPrimeiraLetra(dados.tp || "---");
            
            const adm = formatarData(dados.adm);
            const dem = formatarData(dados.dem);
            
            document.getElementById("lblPeriodo").innerText = `${adm} a ${dem}`;
            
            const elemDesligamento = document.getElementById("lblDesligamento");
            if (elemDesligamento) elemDesligamento.innerText = dem;

            // Filtra proventos e descontos (ignorando bases) e ordena por código
            const proventos = dados.ver ? dados.ver.filter(item => item.t === 'P').sort((a, b) => parseInt(a.o) - parseInt(b.o)) : [];
            const descontos = dados.ver ? dados.ver.filter(item => item.t === 'D').sort((a, b) => parseInt(a.o) - parseInt(b.o)) : [];

            let totalProventos = 0;
            let totalDescontos = 0;
            let htmlVerbas = '';

            // Renderiza Proventos
            if (proventos.length > 0) {
                htmlVerbas += `
                    <div style="margin-top: 10px; margin-bottom: 2px;">
                        <h3 style="color: #2e7d32; font-size: 0.92rem; font-weight: bold; border-bottom: 2px solid #f2f2f2; padding-bottom: 2px; margin: 0 0 2px 0;">
                            Proventos
                        </h3>
                    </div>
                `;
                proventos.forEach((verba, index) => {
                    totalProventos += Number(verba.v) || 0;
                    const valFormatado = verba.v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const isLast = (index === proventos.length - 1);
                    const cssClass = isLast ? "verba-row last-item" : "verba-row";

                    htmlVerbas += `
                        <div class="${cssClass}">
                            <span class="verba-nome">${verba.o} - ${verba.n}</span>
                            <span class="verba-valor-p">R$ ${valFormatado}</span>
                        </div>
                    `;
                });
                const totalProventosFormatado = totalProventos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                htmlVerbas += `
                    <div class="verba-total-row">
                        <span class="verba-nome" style="color: #2e7d32; font-weight: 700; font-size: 0.88rem;">Total proventos</span>
                        <span class="verba-valor-p" style="font-size: 0.9rem;">R$ ${totalProventosFormatado}</span>
                    </div>
                `;
            }

            // Renderiza Descontos
            if (descontos.length > 0) {
                htmlVerbas += `
                    <div style="margin-top: 15px; margin-bottom: 2px;">
                        <h3 style="color: #c62828; font-size: 0.92rem; font-weight: bold; border-bottom: 2px solid #f2f2f2; padding-bottom: 2px; margin: 0 0 2px 0;">
                            Descontos
                        </h3>
                    </div>
                `;
                descontos.forEach((verba, index) => {
                    totalDescontos += Number(verba.v) || 0;
                    const valFormatado = verba.v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const isLast = (index === descontos.length - 1);
                    const cssClass = isLast ? "verba-row last-item" : "verba-row";

                    htmlVerbas += `
                        <div class="${cssClass}">
                            <span class="verba-nome">${verba.o} - ${verba.n}</span>
                            <span class="verba-valor-d">R$ ${valFormatado}</span>
                        </div>
                    `;
                });
                const totalDescontosFormatado = totalDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                htmlVerbas += `
                    <div class="verba-total-row">
                        <span class="verba-nome" style="color: #c62828; font-weight: 700; font-size: 0.88rem;">Total descontos</span>
                        <span class="verba-valor-d" style="font-size: 0.9rem;">R$ ${totalDescontosFormatado}</span>
                    </div>
                `;
            }

            // Líquido
            const valorLiquido = totalProventos - totalDescontos;
            const valorLiquidoFormatado = valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            htmlVerbas += `
                <div class="verba-liquido-row">
                    <span class="verba-nome" style="color: #00379d; font-weight: 700; font-size: 0.88rem;">Líquido de rescisão</span>
                    <span class="verba-valor-p" style="color: #00379d; font-size: 0.95rem;">R$ ${valorLiquidoFormatado}</span>
                </div>
            `;

            const container = document.getElementById("listaVerbas");
            if (container) container.innerHTML = htmlVerbas;

            // Preenche o Dropdown de Seleção de Verbas de A a Z
            const selectVerbas = document.getElementById("selectVerbas");
            if (selectVerbas && dados.ver) {
                selectVerbas.innerHTML = `<option value="">Selecione uma verba do seu demonstrativo</option>`;
                
                const verbasComIndice = dados.ver.map((verba, originalIndex) => ({ verba, originalIndex }));
                
                verbasComIndice.sort((a, b) => {
                    const nomeA = a.verba.n.replace(/^[0-9\s\-]+/, "").trim();
                    const nomeB = b.verba.n.replace(/^[0-9\s\-]+/, "").trim();
                    return nomeA.localeCompare(nomeB, 'pt-BR');
                });

                verbasComIndice.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.originalIndex;
                    option.textContent = `${item.verba.o} - ${item.verba.n}`;
                    selectVerbas.appendChild(option);
                });

                selectVerbas.addEventListener("change", (e) => {
                    const idx = e.target.value;
                    const painel = document.getElementById("painelExplicacao");

                    if (!painel) return;

                    if (idx === "" || idx === null) {
                        painel.style.display = "none";
                        return;
                    }

                    const item = dados.ver[idx];
                    const valFormat = item.v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const tipoTexto = item.t === 'P' ? "Provento (Valor a receber)" : "Desconto (Valor abatido)";

                    const expTitulo = document.getElementById("expTitulo");
                    const expConceito = document.getElementById("expConceito");
                    const expCalculo = document.getElementById("expCalculo");
                    const expValorExplicacao = document.getElementById("expValorExplicacao");

                    if (expTitulo) expTitulo.innerText = `${item.o} - ${item.n}`;
                    if (expConceito) expConceito.innerText = item.co || "Rubrica registrada na rescisão contratual.";
                    
                    // Monta uma explicação inteligente baseada na métrica real do evento (Dias, Horas ou Valor) e salário
                    let textoCalculoDinamico = item.ca || "Apurado conforme regras de folha e rescisão.";
                    
                    if (item.me && item.r > 0) {
                        const metricaFormatada = item.me.toLowerCase();
                        const salFormat = item.s ? item.s.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";
                        
                        if (metricaFormatada.includes("dia")) {
                            textoCalculoDinamico += `<br><br>💡 <b>Exemplo prático do seu cálculo:</b> Considerou ${item.r} ${metricaFormatada}(s) com base no seu salário de R$ ${salFormat}.`;
                        } else if (metricaFormatada.includes("hora")) {
                            textoCalculoDinamico += `<br><br>💡 <b>Exemplo prático do seu cálculo:</b> Considerou ${item.r} ${metricaFormatada}(s) apuradas no seu apontamento.`;
                        } else {
                            textoCalculoDinamico += `<br><br>💡 <b>Referência aplicada:</b> ${item.r} (${item.me}).`;
                        }
                    }

                    if (expCalculo) expCalculo.innerHTML = textoCalculoDinamico;
                    if (expValorExplicacao) expValorExplicacao.innerHTML = `<b>Valor calculado na sua rescisão:</b> R$ ${valFormat} [${tipoTexto}]`;

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