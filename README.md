# Entre Consultas

Protótipo demonstrativo de acompanhamento entre consultas, separado em `index.html`, `styles.css` e `app.js`.

## Abrir

Extraia o ZIP e mantenha os três arquivos na mesma pasta. Abra `index.html` em um navegador moderno. O protótipo não usa servidor nem dependências externas.

## Salvamento

Os registros ficam no `localStorage` do navegador e permanecem nesse perfil até que os dados do site sejam apagados. Há validação e limite de tamanho para os registros, mas o navegador não criptografa esses dados para o aplicativo.

**Use apenas dados fictícios.** Não há contas, autenticação, controle real de acesso entre as visões, sincronização ou banco de dados. A exportação cria um JSON com os relatos e precisa ser guardada em local privado.

O protótipo organiza autorrelatos; não avalia diagnóstico, surto, progressão ou tratamento. O teste de digitação é experimental e não validado.

Consulte [SECURITY.md](SECURITY.md) antes de qualquer evolução com dados reais.

