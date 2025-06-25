\c garciatec;

ALTER TABLE orders DISABLE TRIGGER ALL;
ALTER TABLE order_items DISABLE TRIGGER ALL;
ALTER TABLE stock DISABLE TRIGGER ALL;

INSERT INTO users (name, email, password, user_type) VALUES
('Igor Avila', 'igor.avila@email.com', 'senha_igor', 'customer'),
('Marcio Torres', 'marcio.torres@email.com', 'senha_marcio', 'customer'),
('Felipe Cirne', 'felipe.cirne@admin.com', 'admin_felipe', 'admin'),
('Daniel de Carvalho', 'daniel.carvalho@admin.com', 'admin_daniel', 'admin');

INSERT INTO menu_items (name, description, price, is_available) VALUES
('Hamburguer Clássico', 'Pão, carne, queijo, alface, tomate.', 35.00, TRUE),
('Hamburguer X-Salada', 'Pão, carne, queijo, presunto, alface, tomate.', 38.00, TRUE),
('Hamburguer X-Bacon', 'Pão, carne, queijo, bacon, alface, tomate.', 42.00, TRUE),
('Hamburguer X-Tudo', 'Pão, carne, queijo, bacon, ovo, milho, ervilha, batata palha, alface, tomate.', 48.00, TRUE),
('Coca-Cola Lata 350ml', 'Refrigerante Coca-Cola 350ml.', 8.00, TRUE),
('Guaraná Lata 350ml', 'Refrigerante Guaraná 350ml.', 8.00, TRUE),
('Água Mineral 500ml', 'Água mineral sem gás.', 5.00, TRUE),
('Suco de Laranja 300ml', 'Suco natural de laranja.', 12.00, TRUE);

INSERT INTO stock (item_id, quantity) VALUES
((SELECT id FROM menu_items WHERE name = 'Hamburguer Clássico'), 80),
((SELECT id FROM menu_items WHERE name = 'Hamburguer X-Salada'), 70),
((SELECT id FROM menu_items WHERE name = 'Hamburguer X-Bacon'), 60),
((SELECT id FROM menu_items WHERE name = 'Hamburguer X-Tudo'), 50),
((SELECT id FROM menu_items WHERE name = 'Coca-Cola Lata 350ml'), 200),
((SELECT id FROM menu_items WHERE name = 'Guaraná Lata 350ml'), 180),
((SELECT id FROM menu_items WHERE name = 'Água Mineral 500ml'), 250),
((SELECT id FROM menu_items WHERE name = 'Suco de Laranja 300ml'), 150);



INSERT INTO orders (customer_id, status_id, order_date, expected_delivery_date, actual_delivery_date) VALUES
((SELECT id FROM users WHERE email = 'igor.avila@email.com'), 1, '2025-06-23 18:00:00', '2025-06-23 18:45:00', NULL), --  Pendente

((SELECT id FROM users WHERE email = 'marcio.torres@email.com'), 2, '2025-06-23 19:15:00', '2025-06-23 20:00:00', NULL), -- Em Preparo

((SELECT id FROM users WHERE email = 'igor.avila@email.com'), 5, '2025-06-22 13:00:00', '2025-06-22 13:45:00', '2025-06-22 13:30:00'), -- Entregue

((SELECT id FROM users WHERE email = 'marcio.torres@email.com'), 6, '2025-06-22 14:30:00', '2025-06-22 15:15:00', NULL), -- Cancelado
((SELECT id FROM users WHERE email = 'igor.avila@email.com'), 1, '2025-06-24 10:00:00', '2025-06-24 10:45:00', NULL); -- Pendente


INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'igor.avila@email.com') AND order_date = '2025-06-23 18:00:00'), (SELECT id FROM menu_items WHERE name = 'Hamburguer X-Salada'), 2, 38.00),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'igor.avila@email.com') AND order_date = '2025-06-23 18:00:00'), (SELECT id FROM menu_items WHERE name = 'Coca-Cola Lata 350ml'), 2, 8.00);

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'marcio.torres@email.com') AND order_date = '2025-06-23 19:15:00'), (SELECT id FROM menu_items WHERE name = 'Hamburguer Clássico'), 1, 35.00),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'marcio.torres@email.com') AND order_date = '2025-06-23 19:15:00'), (SELECT id FROM menu_items WHERE name = 'Guaraná Lata 350ml'), 1, 8.00);

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'igor.avila@email.com') AND order_date = '2025-06-22 13:00:00'), (SELECT id FROM menu_items WHERE name = 'Hamburguer X-Bacon'), 1, 42.00),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'igor.avila@email.com') AND order_date = '2025-06-22 13:00:00'), (SELECT id FROM menu_items WHERE name = 'Água Mineral 500ml'), 1, 5.00);

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'marcio.torres@email.com') AND order_date = '2025-06-22 14:30:00'), (SELECT id FROM menu_items WHERE name = 'Hamburguer X-Tudo'), 1, 48.00);

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'igor.avila@email.com') AND order_date = '2025-06-24 10:00:00'), (SELECT id FROM menu_items WHERE name = 'Hamburguer Clássico'), 1, 35.00),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = 'igor.avila@email.com') AND order_date = '2025-06-24 10:00:00'), (SELECT id FROM menu_items WHERE name = 'Suco de Laranja 300ml'), 1, 12.00);


ALTER TABLE orders ENABLE TRIGGER ALL;
ALTER TABLE order_items ENABLE TRIGGER ALL;
ALTER TABLE stock ENABLE TRIGGER ALL;

UPDATE orders
SET total_amount = calculate_order_total(id)
WHERE total_amount = 0.00 OR total_amount IS NULL;