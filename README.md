# URL Shortener Backend

Este é o backend para uma aplicação de encurtamento de URLs, construído com Node.js e Fastify. Ele fornece uma API RESTful para registrar usuários, criar, gerenciar e acessar URLs encurtadas.

## Funcionalidades

-   **Autenticação de Usuários:** Sistema completo de registro e login com JWT (Access & Refresh Tokens).
-   **Encurtamento de URLs:** Criação de links curtos e únicos para URLs longas.
-   **Proteção de Links:** Proteja suas URLs encurtadas com uma senha.
-   **Links com Expiração:** Defina um tempo para que o link expire e seja automaticamente removido.
-   **Visualização de Detalhes:** Acesse os detalhes de suas URLs encurtadas.
-   **Segurança:** Implementado com as melhores práticas, incluindo `helmet`, `cors`, `rate limiting` e proteção `CSRF`.

## Tecnologias Utilizadas

-   **Framework:** [Fastify](https://www.fastify.io/)
-   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
-   **Autenticação:** [JSON Web Tokens (JWT)](https://jwt.io/)
-   **Hashing de Senhas:** [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)

## Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 14 ou superior)
-   [pnpm](https://pnpm.io/) (ou `npm`/`yarn`)
-   Uma instância do [PostgreSQL](https://www.postgresql.org/) rodando.

## Instalação e Execução

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/PedroDallaCosta/url-shortener-backend.git
    cd url-short-backend
    ```

2.  **Instale as dependências:**

    ```bash
    pnpm install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do projeto, copiando o `.env.example`.

    ```bash
    copy .env.example .env
    ```

    Preencha o arquivo `.env` com as suas configurações (banco de dados, segredos JWT, etc.).

4.  **Inicialize o banco de dados:**

    O projeto inclui um script para criar as tabelas necessárias. Execute-o com:

    ```bash
    pnpm run database
    ```

5.  **Inicie o servidor:**

    -   Para desenvolvimento (com hot-reload):
        ```bash
        pnpm run dev
        ```
    -   Para produção:
        ```bash
        pnpm start
        ```

O servidor estará rodando em `http://localhost:3000` (ou na porta que você configurou).

## Documentação da API

Após iniciar o servidor, a documentação completa da API, gerada com Swagger, estará disponível em:

**`http://localhost:3000/docs`**

Lá você encontrará todos os endpoints, schemas e poderá testar a API diretamente pelo navegador.