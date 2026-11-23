# Entre Consultas — protótipo de acompanhamento de EM

Protótipo demonstrativo separado em `index.html`, `styles.css` e `app.js`. Mantenha os três arquivos na mesma pasta para abrir localmente.

## Abrir localmente

1. Baixe o repositório pelo botão **Code → Download ZIP**.
2. Extraia o ZIP, mantendo os arquivos juntos.
3. Abra `index.html` no navegador.

## Recursos

- Vários registros por dia, com horário e linha do tempo.
- Relatos de sintomas, início, duração percebida, intensidade opcional e impacto nas atividades.
- Áreas opcionais de energia/fadiga, sono, humor e participação nas atividades.
- Exportação JSON dos registros próprios salvos neste navegador.
- Painel demonstrativo da equipe e resumo para consulta.
- Tarefa de digitação experimental, sem interpretação clínica.

As categorias de bem-estar são próprias e exploratórias; não reproduzem nem validam o Neuro-QoL, EDSS ou outro instrumento clínico.

## Salvamento e limites

Os registros ficam em `localStorage` no mesmo navegador e dispositivo e não sincronizam. Use apenas dados fictícios: as abas não implementam autenticação ou controle real de acesso. Guarde cópias exportadas em local privado.

O protótipo não confirma surto, progressão, diagnóstico ou tratamento.

## Referências

- Neuro-QoL em pessoas com EM: https://pubmed.ncbi.nlm.nih.gov/31819803/
- National MS Society: https://www.nationalmssociety.org/understanding-ms/what-is-ms/ms-symptoms
- W3C WAI, rótulos de formulários: https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions
- ANPD, dados de saúde na LGPD: https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes
