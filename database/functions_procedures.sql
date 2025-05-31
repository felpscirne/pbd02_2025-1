CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id INTEGER)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    order_total DECIMAL(10, 2);
BEGIN
    SELECT SUM(oi.quantity * oi.unit_price)
    INTO order_total
    FROM order_items oi
    WHERE oi.order_id = p_order_id;

    RETURN COALESCE(order_total, 0.00);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE PROCEDURE register_order(
    p_customer_id INTEGER,
    p_items JSONB
)
AS $$
DECLARE
    v_order_id INTEGER;
    v_item RECORD;
    v_item_price DECIMAL(10,2);
    v_pending_status_id INTEGER;
BEGIN
    SELECT id INTO v_pending_status_id FROM order_statuses WHERE status_name = 'Pending';

    IF v_pending_status_id IS NULL THEN
        RAISE EXCEPTION 'Status "Pending" not found. Check the order_statuses table.';
    END IF;

    BEGIN
        INSERT INTO orders (customer_id, status_id, total_amount)
        VALUES (p_customer_id, v_pending_status_id, 0.00)
        RETURNING id INTO v_order_id;

        FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(menu_item_id INTEGER, quantity INTEGER)
        LOOP
            SELECT price INTO v_item_price
            FROM menu_items
            WHERE id = v_item.menu_item_id;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Menu item with ID % not found.', v_item.menu_item_id;
            END IF;

            --  trg_validate_stock
            INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
            VALUES (v_order_id, v_item.menu_item_id, v_item.quantity, v_item_price);
        END LOOP;

        -- valor total do pedido após todos os itens serem inseridos
        UPDATE orders
        SET total_amount = calculate_order_total(v_order_id)
        WHERE id = v_order_id;

    EXCEPTION
        WHEN OTHERS THEN
            -- se erros (incluindo erro da trigger de estoque), a transação será revertida
            RAISE EXCEPTION 'Error registering order: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION list_orders(p_status_name TEXT)
RETURNS TABLE (
    id INTEGER,
    customer_name VARCHAR(100),
    status VARCHAR(50),
    order_date TIMESTAMP,
    total_amount DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        u.name AS customer_name,
        os.status_name AS status,
        o.order_date,
        o.total_amount
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    JOIN order_statuses os ON o.status_id = os.id
    WHERE os.status_name ILIKE p_status_name;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION change_order_status(p_order_id INTEGER, p_new_status_name TEXT)
RETURNS VOID AS $$
DECLARE
    v_current_status_id INTEGER;
    v_new_status_id INTEGER;
    v_current_status_name VARCHAR(50);
BEGIN
    -- obtem status e id do pedido atual
    SELECT o.status_id, os.status_name
    INTO v_current_status_id, v_current_status_name
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.id
    WHERE o.id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order with ID % not found.', p_order_id;
    END IF;

    SELECT id INTO v_new_status_id FROM order_statuses WHERE status_name ILIKE p_new_status_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Status "%" is not a valid status.', p_new_status_name;
    END IF;

    -- A validação da transição de status será feita por um trigger (trg_validate_status_transition)
    -- O log de alteração será feito por um trigger (trg_log_change)
    -- O log de cancelamento será feito por um trigger (trg_log_cancellation)

    UPDATE orders
    SET
        status_id = v_new_status_id,
        actual_delivery_date = CASE
            WHEN p_new_status_name ILIKE 'Delivered' THEN CURRENT_TIMESTAMP
            ELSE actual_delivery_date
        END
    WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql;