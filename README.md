# Entre Consultas

Protótipo de diário de acompanhamento pessoal. Ele começa sem pacientes nem registros de exemplo. Faça seus próprios registros; depois do primeiro, a visão **Minha análise** mostra os gráficos e permite preparar um resumo.

## Abrir

Extraia o ZIP e mantenha `index.html`, `styles.css` e `app.js` juntos. Abra `index.html` em um navegador moderno. O protótipo não usa servidor nem dependências externas.

## Salvamento e privacidade

Os registros são guardados no `localStorage` deste navegador. O botão **Apagar meus registros** limpa o acompanhamento atual. Ao carregar esta versão, o aplicativo também tenta remover o armazenamento da demonstração antiga.

Não há autenticação, controle real de acesso ou criptografia. Use somente dados fictícios; não registre informações reais de saúde. Arquivos JSON exportados contêm relatos e devem ser guardados em local privado.

Os gráficos organizam autorrelatos; não determinam diagnóstico, surto ou progressão. O teste de digitação é experimental e não validado.

Consulte [SECURITY.md](SECURITY.md) antes de qualquer evolução com dados reais.

