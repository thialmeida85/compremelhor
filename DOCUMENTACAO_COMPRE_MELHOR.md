# Documentação do Projeto "Compre Melhor" - Versão Turbinada

Este documento detalha as novas funcionalidades implementadas no projeto "Compre Melhor", bem como as instruções atualizadas para configuração, deploy e uso. O objetivo é transformar a plataforma num sistema mais robusto, otimizado para SEO, com capacidades administrativas e integração com IA para geração de conteúdo.

## 🚀 Novas Funcionalidades

### 1. Otimização SEO Avançada (Schema Markup e Metadados Dinâmicos)

Para melhorar a visibilidade nos motores de busca e a apresentação dos resultados, foram implementadas as seguintes otimizações:

*   **Schema Markup (JSON-LD)**: A página de detalhes do produto (`src/app/oferta/[slug]/page.tsx`) agora gera automaticamente o Schema Markup do tipo `Product`. Isso permite que o Google exiba *Rich Snippets* (como preço, disponibilidade e avaliações) diretamente nos resultados de pesquisa, aumentando a taxa de cliques.
    *   **Componente `SchemaMarkup`**: Um novo componente (`src/components/seo/SchemaMarkup.tsx`) foi criado para injetar o JSON-LD no `<head>` da página.
    *   **Utilitário `generateProductSchema`**: A função em `src/lib/seo.ts` constrói o objeto JSON-LD com base nos dados do produto.
*   **Metadados Dinâmicos (Next.js `generateMetadata`)**: A página de produto agora gera metadados dinâmicos (`<title>`, `<meta name="description">`, `og:image`, `twitter:card`, etc.) com base nas informações do produto, otimizando a partilha em redes sociais e a indexação.
*   **Sitemap Dinâmico**: Uma nova API Route (`src/app/api/sitemap/route.ts`) foi criada para gerar um `sitemap.xml` dinâmico. Este sitemap inclui a página inicial, todas as categorias e todos os produtos ativos, garantindo que os motores de busca indexem o conteúdo mais recente. O sitemap é cacheado por 1 hora (`s-maxage=3600`).

### 2. Dashboard Administrativo Básico

Foi implementado um painel administrativo básico para permitir a visualização de métricas e futuras ações de gestão. Este dashboard está acessível em `/admin/dashboard`.

*   **Visão Geral de Estatísticas**: Exibe o número total de produtos ativos, categorias, lojas e utilizadores.
*   **Atividade Recente**: Mostra o número de cliques em links de afiliados nos últimos 7 dias e a média diária.
*   **Produtos Mais Clicados**: Lista os 5 produtos que geraram mais cliques nos últimos 7 dias, com links diretos para as suas páginas.
*   **Ações Rápidas**: Botões de atalho para futuras páginas de gestão de produtos, categorias, lojas e analytics completos.
*   **API de Analytics**: Uma nova API Route (`src/app/api/analytics/route.ts`) foi criada para fornecer dados de analytics em formato JSON, que podem ser consumidos pelo dashboard ou por outras ferramentas.

### 3. Integração com Groq para Geração de Conteúdo (Copywriting)

Foi preparada a estrutura para integrar a IA Groq para automatizar a geração de descrições de produtos, melhorando a qualidade e a velocidade da criação de conteúdo.

*   **Utilitário `src/lib/groq.ts`**: Contém funções para interagir com a API do Groq:
    *   `generateOptimizedDescription`: Transforma descrições técnicas em textos persuasivos focados em benefícios.
    *   `generateShortDescription`: Cria resumos curtos para produtos.
    *   `generateProductComparison`: Gera comparações entre dois produtos (funcionalidade futura).
*   **API Route para Geração de Descrição**: Uma nova API Route (`src/app/api/ai/generate-description/route.ts`) permite solicitar descrições otimizadas ou curtas via POST, passando o título, descrição técnica e marca do produto.
*   **Variável de Ambiente `GROQ_API_KEY`**: Adicionada ao `.env.example` para configurar a chave de API do Groq.

## 🛠️ Configuração e Deploy Atualizados

### 1. Descompactar o Projeto

Descompacte o ficheiro `compre_melhor_testado_e_validado.zip` para a pasta desejada.

### 2. Configurar o Ambiente (`.env`)

Crie um ficheiro `.env` na raiz do projeto (ao lado do `package.json`) com base no `.env.example` fornecido. **Não comite este ficheiro para o Git!**

```env
# ==========================================
# BANCO DE DADOS (MySQL)
# FORMATO: mysql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
# ==========================================
DATABASE_URL="mysql://usuario:senha@agenciaverticale.com.br:3306/thi90621_comprecerto"

# ==========================================
# AUTENTICAÇÃO (NextAuth.js)
# Gere uma chave secreta com: openssl rand -base64 32
# ==========================================
NEXTAUTH_URL="http://localhost:3000" # Para desenvolvimento local
NEXTAUTH_SECRET="sua-chave-secreta-aqui-gere-com-openssl"

# ==========================================
# IA E COPYWRITING (Groq)
# Obtenha a chave em: https://console.groq.com
# ==========================================
GROQ_API_KEY="sua-chave-groq-aqui"

# ==========================================
# VARIÁVEIS OPCIONAIS
# ==========================================
NODE_ENV=production
# NEXT_PUBLIC_API_URL="https://seu-dominio.com"
```

**Atenção**: Para deploy no Render, `NEXTAUTH_URL` deve ser o URL do seu serviço no Render (ex: `https://seu-dominio-render.onrender.com`).

### 3. Instalar Dependências

Abra o terminal na raiz do projeto e execute:

```bash
npm install --legacy-peer-deps
# ou
yarn install
```

### 4. Sincronizar a Base de Dados

Certifique-se de que as credenciais `DATABASE_URL` estão corretas e que o IP do seu ambiente (local ou Render) está autorizado no "MySQL Remoto" do HostGator. Em seguida, execute:

```bash
npx prisma db push
```

### 5. Popular a Base de Dados (Opcional)

Para adicionar dados de exemplo (lojas, categorias, produtos), execute:

```bash
npm run prisma:seed
```

### 6. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O site estará acessível em `http://localhost:3000`.

## 🚀 Deploy no Render

Para fazer deploy no Render, siga estes passos:

1.  **Conecte o seu repositório Git** (GitHub, GitLab, Bitbucket) ao Render.
2.  **Crie um novo Web Service** no Render.
3.  **Configurações de Build**:
    *   **Build Command**: `npm install --legacy-peer-deps && npm run build`
    *   **Start Command**: `npm start`
4.  **Variáveis de Ambiente**: Adicione as variáveis `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` e `GROQ_API_KEY` no dashboard do Render, com os valores apropriados para o ambiente de produção.
    *   `NEXTAUTH_URL` deve ser o URL do seu serviço no Render (ex: `https://compre-melhor.onrender.com`).

## ⚠️ Notas Importantes

*   **Credenciais do Banco de Dados**: Verifique sempre as credenciais do MySQL no HostGator e as permissões de acesso remoto.
*   **Segurança**: Mantenha `NEXTAUTH_SECRET` e `GROQ_API_KEY` seguras e nunca as exponha publicamente.
*   **Performance**: A página inicial utiliza `export const dynamic = "force-dynamic"` para evitar erros de conexão ao banco durante o build. Para otimizações futuras, considere implementar cache de dados mais robusto.
*   **Vulnerabilidades**: Foram identificadas 4 vulnerabilidades (3 moderadas, 1 alta) nas dependências. Recomenda-se executar `npm audit fix --force` após a instalação para tentar corrigi-las, embora algumas possam ser de dependências transitivas e não diretamente controláveis.

Com estas melhorias e a documentação detalhada, o seu projeto "Compre Melhor" está agora mais completo e preparado para o sucesso!
