# Segurança e privacidade

## Escopo deste protótipo

Este é um protótipo estático de acompanhamento pessoal. Ele inicia sem pacientes ou registros de demonstração. Os registros próprios ficam no armazenamento local do navegador (`localStorage`), em texto acessível ao mesmo perfil. Não há autenticação, autorização, criptografia, cópia de segurança automática, sincronização ou trilha de auditoria. A aba de análise é apenas uma mudança visual; não restringe acesso.

O código valida os registros recuperados do armazenamento, limita tamanho e quantidade, e escreve texto fornecido pelo usuário usando APIs de texto do DOM. Essas medidas ajudam a evitar corrupção acidental e injeção de HTML no protótipo; não protegem os dados de alguém com acesso ao navegador ou ao perfil do sistema.

## Uso permitido

- Utilize somente dados fictícios e identificadores de demonstração.
- Não use nomes, contatos, sintomas ou qualquer dado real de pacientes.
- Trate arquivos JSON exportados como informação sensível e mantenha-os em local privado.
- Ao abrir a nova versão, o app tenta apagar o armazenamento local usado pela antiga demonstração, conforme pedido para iniciar vazio.

## Requisitos antes de dados reais

Não habilite uso clínico com a arquitetura atual. Um produto real requer, no mínimo, avaliação de privacidade e segurança; backend e banco de dados com controles de acesso por função; autenticação e gestão segura de sessão; criptografia em trânsito e em repouso; logs de auditoria sem exposição de dados; cópias de segurança e retenção com descarte; gestão de incidentes; revisão jurídica/regulatória e validação clínica do conteúdo e das medidas. O uso de dados de saúde deve ser analisado conforme a LGPD e as regras aplicáveis.

