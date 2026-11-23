# Entre Consultas — protótipo de acompanhamento de EM

Protótipo demonstrativo de diário do paciente e painel de acompanhamento da equipe. A página é independente e não precisa de instalação.

## O que o protótipo faz

- Aceita vários registros ao longo do mesmo dia e mostra horário na linha do tempo.
- Organiza relatos de sintomas, data de início e duração percebida.
- Permite registrar, opcionalmente, intensidade percebida (0–10) e impacto nas atividades habituais.
- Oferece categorias opcionais de bem-estar, como energia/fadiga, sono, humor e participação nas atividades.
- Gera uma cópia JSON dos registros próprios salvos neste navegador.
- Mantém a tarefa de digitação como atividade experimental, sem interpretação clínica.
- Separa autorrelatos do paciente dos campos clínicos de demonstração preenchidos pela equipe.

Os campos de bem-estar são categorias próprias inspiradas em domínios de autorrelato estudados em esclerose múltipla. Não reproduzem nem validam o Neuro-QoL, o EDSS ou outro instrumento clínico.

## Abrir localmente

1. Baixe o repositório pelo botão **Code → Download ZIP**.
2. Extraia o arquivo ZIP.
3. Abra `index.html` no navegador.

## Salvamento temporário

Os registros ficam em `localStorage` no mesmo navegador e dispositivo. Permanecem após fechar e reabrir a página, até que os dados do site sejam limpos. Não há servidor, autenticação ou sincronização entre dispositivos. **Use somente dados fictícios.** Se baixar uma cópia JSON, guarde o arquivo em local privado.

## Limites da demonstração

- As abas de paciente/equipe apenas simulam perfis; não controlam acesso.
- Os dados apresentados são fictícios.
- As categorias e escalas próprias são autorrelatos exploratórios, não instrumentos validados.
- O teste de digitação não é validado.
- O protótipo não confirma surto, progressão, diagnóstico ou tratamento.

## Referências usadas no desenho

- Medina et al., validação das formas curtas Neuro-QoL em pessoas com EM: https://pubmed.ncbi.nlm.nih.gov/31819803/ (usado como referência de domínios; o artigo também relata que o ajuste do modelo não foi adequado para a maioria dos domínios avaliados).
- National Multiple Sclerosis Society, sintomas e acompanhamento de sintomas: https://www.nationalmssociety.org/understanding-ms/what-is-ms/ms-symptoms
- W3C WAI, rótulos e instruções em formulários: https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions
- ANPD, perguntas frequentes da LGPD e dados de saúde como dados pessoais sensíveis: https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes
