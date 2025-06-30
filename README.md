# Sistema Web de Gestão de Pedidos para Restaurante

Este projeto consiste em um sistema web para gerenciamento de pedidos de um restaurante, com foco na robustez da lógica de negócios implementada diretamente no banco de dados PostgreSQL e uma API RESTful em Python Flask para comunicação com um frontend moderno em React.

## 🎯 Objetivo do Projeto

O principal objetivo deste projeto didático é demonstrar uma arquitetura de aplicação onde a **lógica de negócios crítica, validação de dados e garantia de consistência são delegadas ao banco de dados PostgreSQL**, utilizando suas funcionalidades avançadas como funções (Stored Procedures) e Triggers. O backend em Flask atua como uma camada leve de API, apenas expondo essas funcionalidades para o frontend em React, que oferece uma interface de usuário dinâmica.

## ⚙️ Tecnologias Utilizadas

* **Backend:**
    * **Python 3:** Linguagem de programação.
    * **Flask:** Microframework web para construção da API RESTful.
    * **Psycopg2:** Adaptador PostgreSQL para Python, permitindo a comunicação eficiente com o banco de dados.
    * **python-dotenv:** Para gerenciamento de variáveis de ambiente (credenciais de banco, etc.).
    * **Flask-CORS:** Para gerenciar permissões de Cross-Origin Resource Sharing entre o frontend e o backend.
* **Banco de Dados:**
    * **PostgreSQL:** Sistema de gerenciamento de banco de dados relacional.
    * **PL/pgSQL:** Linguagem procedural do PostgreSQL, usada para criar Funções (incluindo as que retornam IDs), Stored Procedures e Funções de Triggers.
    * **Triggers:** Gatilhos implementados no banco para garantir a consistência de dados (estoque, transição de status, logs de auditoria).
* **Frontend:**
    * **React:** Biblioteca JavaScript para construção da interface de usuário.
    * **TypeScript:** Superset do JavaScript que adiciona tipagem estática, melhorando a robustez e manutenibilidade do código frontend.
    * **Tailwind CSS:** Framework CSS utility-first para construção rápida e flexível da interface de usuário.
    * **Vite:** Ferramenta de build de frontend de próxima geração que oferece um desenvolvimento extremamente rápido.
    * **Node.js:** Ambiente de execução JavaScript e gerenciador de pacotes para o React.

## 🧩 Componentes do Projeto

### 🗃️ Estrutura do Banco de Dados (PostgreSQL)

O banco de dados `garciatec` é o coração da lógica de negócios, com as seguintes tabelas principais:

* **`users`**: Armazena informações de clientes e administradores.
* **`order_statuses`**: Define os possíveis status de um pedido (e.g., 'Pending', 'Delivered').
* **`menu_items`**: Lista os produtos disponíveis para venda (Hambúrgueres e Bebidas).
* **`stock`**: Mantém o controle de quantidade disponível para cada item do cardápio.
* **`orders`**: Registra os pedidos feitos pelos clientes.
* **`order_items`**: Detalha quais itens e quantidades compõem cada pedido.
* **`logs`**: Grava um histórico de alterações importantes nos pedidos para auditoria.

### ⚙️ Funções (Stored Procedures) e Triggers no PostgreSQL

As funcionalidades críticas são implementadas diretamente no banco:

* **`calculate_order_total(p_order_id INTEGER)`**: Função para somar o valor de todos os itens de um pedido.
* **`register_order(p_customer_id INTEGER, p_items JSONB)`**: Função (anteriormente procedure) principal para criar um novo pedido. Ela recebe o ID do cliente e um JSON com os itens, insere os dados, valida o estoque via trigger e calcula o total. Retorna o ID do pedido criado.
* **`list_orders(p_status_name TEXT)`**: Retorna uma lista de pedidos, opcionalmente filtrando por status.
* **`change_order_status(p_order_id INTEGER, p_new_status_name TEXT)`**: Altera o status de um pedido. As transições de status são validadas por triggers.

As **Triggers** garantem a consistência e a auditoria:

* **`trg_log_change` (Função: `log_order_change()`)**: Registra automaticamente qualquer alteração nas colunas críticas da tabela `orders` (status, total, data de entrega) na tabela `logs`.
* **`trg_validate_stock` (Função: `validate_stock()`)**: Impede a criação de um item de pedido se não houver estoque suficiente, lançando um erro.
* **`trg_deduct_stock` (Função: `deduct_stock()`)**: Deduz automaticamente a quantidade de itens do estoque após a inserção bem-sucedida em `order_items`.
* **`trg_validate_status_transition` (Função: `validate_status_transition()`)**: Garante que as transições de status de pedidos sejam válidas (ex: um pedido "entregue" não pode voltar para "em preparo").
* **`trg_log_cancellation` (Função: `log_cancellation()`)**: Cria um log específico sempre que um pedido muda para o status "Canceled".

## 🚀 Como Levantar a Aplicação

Siga os passos abaixo para configurar e executar o projeto.

### 1. Pré-requisitos

Certifique-se de ter instalado:

* **Git**
* **Python 3.8+** e **pip**
* **Node.js** e **vite**
* **PostgreSQL** (Servidor de Banco de Dados)
* **Cliente `psql`** (geralmente vem com a instalação do PostgreSQL)

### 2. Execução Automatizada com `start_app.sh`

Para levantar toda a aplicação (preparar o banco, iniciar o backend Flask e o frontend React), utilize o script `start_app.sh`.

1.  **Navegue até o diretório raiz do projeto** no seu terminal (onde o `start_app.sh` está localizado).
2.  **Conceda permissões de execução ao script (se necessário):**
    ```bash
    chmod +x start_app.sh
    ```
3.  **Ajuste as variáveis de ambiente e credenciais:**
    * No script `start_app.sh`, revise e ajuste `DB_USER`, `DB_HOST`, `DB_NAME` conforme suas configurações do PostgreSQL.
    * No arquivo `back/.env`, certifique-se de que a `DATABASE_URL` e `CORS_ORIGINS` estão corretas para seu ambiente.
4.  **Execute o script:**
    ```bash
    ./start_app.sh
    ```
    O script irá:
    * Dropar e recriar o banco de dados `garciatec` (apagando dados anteriores).
    * Executar todos os scripts SQL (`init_tables.sql`, `functions_procedures.sql`, `triggers.sql`, `seed_data.sql`).
    * Ativar o ambiente virtual Python e iniciar o servidor Flask em segundo plano.
    * Instalar dependências (se descomentado no script) e iniciar o servidor de desenvolvimento React com Vite em segundo plano.

    Você verá mensagens no terminal sobre o progresso de cada etapa e os PIDs dos processos do Flask e React.

### 3. Acessando a Aplicação

* **Backend Flask:** `http://localhost:5000`
* **Frontend React:** `http://localhost:5173` (Esta é a porta padrão do Vite para desenvolvimento).

### 4. Parando a Aplicação

Para parar os processos do Flask e React iniciados pelo `start_app.sh`, você pode:

* Usar os PIDs exibidos pelo script ao iniciar (ex: `kill <FLASK_PID> <REACT_PID>`).
* Ou usar comandos para matar processos pelo nome (menos preciso): `pkill -f python3` e `pkill -f node`.

## 🚦 Rotas da API (Backend Flask)

O backend Flask expõe as seguintes rotas:

* `GET /api/cardapio`: Retorna todos os itens do cardápio.
* `GET /api/pedidos`: Lista pedidos, com a opção de filtrar por status (ex: `/api/pedidos?status=Pending`).
* `POST /api/pedidos`: Cria um novo pedido com os itens fornecidos.
* `PUT /api/pedidos/<int:pedido_id>/status`: Atualiza o status de um pedido específico.
* `GET /api/pedidos/<int:pedido_id>`: Retorna os detalhes de um pedido específico, incluindo seus itens.

## 🧑‍💻 Colaboração e Contribuição

Este é um projeto didático. Contribuições e sugestões são bem-vindas para aprendizado e aprimoramento.
