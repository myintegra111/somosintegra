# InTEGRA — versão V3 SEO Final

Esta atualização preserva o design da V3 e acrescenta a base técnica necessária para indexação, partilha social, desempenho, acessibilidade e publicação na Vercel.

## Incluído

- título SEO e meta description em português de Portugal;
- canonical para `https://www.somosintegra.pt/`;
- diretivas de indexação para Google e outros motores;
- Open Graph para WhatsApp, LinkedIn e Facebook;
- Twitter Card;
- imagem social 1200 × 630;
- dados estruturados Schema.org (`Organization`, `WebSite` e `WebPage`);
- `robots.txt`;
- `sitemap.xml`;
- `llms.txt` e `llms-full.txt`;
- favicons e ícones para browser, Apple e Android;
- `site.webmanifest` e `browserconfig.xml`;
- `security.txt`;
- página 404 personalizada;
- cabeçalhos de segurança e cache para Vercel;
- logótipo WebP otimizado;
- carregamento de fontes otimizado;
- melhorias de acessibilidade e funcionamento sem JavaScript;
- substituição dos botões de vídeo vazios por navegação interna útil.

## Nota sobre “meta keywords”

Não foi incluído `<meta name="keywords">`. O Google não utiliza esse campo para classificar páginas. As expressões relevantes foram integradas no título, descrição, conteúdo visível e dados estruturados de forma natural.

## Search Console

Depois do deployment:

1. cria uma propriedade do tipo **Domínio** para `somosintegra.pt`;
2. adiciona no Domínios.pt o registo TXT fornecido pelo Google;
3. valida a propriedade;
4. envia `sitemap.xml` na secção **Sitemaps**;
5. usa **Inspeção do URL** para `https://www.somosintegra.pt/` e pede indexação.

## Vídeos

Nesta versão pública os capítulos aparecem como conteúdo informativo e links internos, sem botões de reprodução vazios. A estrutura do modal e a pasta `videos` continuam preparadas para futura ativação.
