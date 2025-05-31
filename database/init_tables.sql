CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('cliente', 'admin')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE status_pedido (
    id SERIAL PRIMARY KEY,
    nome_status VARCHAR(50) UNIQUE NOT NULL
);


INSERT INTO status_pedido (nome_status) VALUES
('Pendente'),
('Em Preparo'),
('Pronto para entrega'),
('Em entrega'),
('Entregue'),
('Cancelado');


CREATE TABLE itens_cardapio (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
    disponivel BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE estoque (
    id SERIAL PRIMARY KEY,
    item_id INTEGER UNIQUE NOT NULL REFERENCES itens_cardapio(id),
    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
    data_ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES usuarios(id),
    status_id INTEGER NOT NULL REFERENCES status_pedido(id),
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_entrega_prevista TIMESTAMP,
    data_entrega_realizada TIMESTAMP,
    valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (valor_total >= 0)
);


CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    item_cardapio_id INTEGER NOT NULL REFERENCES itens_cardapio(id),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10, 2) NOT NULL CHECK (preco_unitario >= 0),
    CONSTRAINT unique_item_pedido UNIQUE (pedido_id, item_cardapio_id) 
);


CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    tabela_afetada VARCHAR(100),
    coluna_afetada VARCHAR(100),
    valor_antigo TEXT,
    valor_novo TEXT,
    acao TEXT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT
);