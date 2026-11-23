# Entre Consultas — protótipo de acompanhamento de EM

Protótipo demonstrativo de diário do paciente e painel de acompanhamento da equipe. A página é independente e não precisa de instalação.

## Abrir localmente

1. Baixe o repositório pelo botão **Code → Download ZIP**.
2. Extraia o arquivo ZIP.
3. Abra `index.html` no navegador.

## Salvamento temporário

Os registros do formulário ficam em `localStorage` no mesmo navegador e dispositivo. Eles permanecem após fechar e reabrir a página, até que os dados do site sejam limpos. Não há servidor nem sincronização entre dispositivos.

## Limites da demonstração

- Use apenas dados fictícios: o protótipo não tem autenticação nem controle real de acesso.
- Os dados apresentados são fictícios.
- A tarefa de digitação é experimental e não validada.
- O protótipo não confirma surto, progressão, diagnóstico ou tratamento.
