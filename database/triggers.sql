CREATE OR REPLACE FUNCTION log_order_change()
RETURNS TRIGGER AS $$
DECLARE
    v_old_status_name VARCHAR(50);
    v_new_status_name VARCHAR(50);
    v_log_message TEXT;
BEGIN
    IF TG_OP = 'UPDATE' THEN

        IF NEW.status_id IS DISTINCT FROM OLD.status_id THEN
            SELECT status_name INTO v_old_status_name FROM order_statuses WHERE id = OLD.status_id;
            SELECT status_name INTO v_new_status_name FROM order_statuses WHERE id = NEW.status_id;
            v_log_message := FORMAT('Order %s: Status changed from "%s" to "%s".', NEW.id, v_old_status_name, v_new_status_name);
            INSERT INTO logs (order_id, affected_table, affected_column, old_value, new_value, action, notes)
            VALUES (NEW.id, 'orders', 'status_id', v_old_status_name, v_new_status_name, 'STATUS_CHANGE', v_log_message);
        END IF;

        IF NEW.total_amount IS DISTINCT FROM OLD.total_amount THEN
            v_log_message := FORMAT('Order %s: Total amount changed from $%.2f to $%.2f.', NEW.id, OLD.total_amount, NEW.total_amount);
            INSERT INTO logs (order_id, affected_table, affected_column, old_value, new_value, action, notes)
            VALUES (NEW.id, 'orders', 'total_amount', OLD.total_amount::TEXT, NEW.total_amount::TEXT, 'UPDATE', v_log_message);
        END IF;

        IF NEW.actual_delivery_date IS DISTINCT FROM OLD.actual_delivery_date THEN
            v_log_message := FORMAT('Order %s: Actual delivery date changed from %s to %s.', NEW.id, COALESCE(OLD.actual_delivery_date::TEXT, 'NULL'), NEW.actual_delivery_date::TEXT);
            INSERT INTO logs (order_id, affected_table, affected_column, old_value, new_value, action, notes)
            VALUES (NEW.id, 'orders', 'actual_delivery_date', OLD.actual_delivery_date::TEXT, NEW.actual_delivery_date::TEXT, 'UPDATE', v_log_message);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_change
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_change();


CREATE OR REPLACE FUNCTION validate_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_available_stock INTEGER;
    v_item_name VARCHAR(100);
BEGIN
    SELECT s.quantity, mi.name
    INTO v_available_stock, v_item_name
    FROM stock s
    JOIN menu_items mi ON s.item_id = mi.id
    WHERE s.item_id = NEW.menu_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Menu item with ID % not found in stock.', NEW.menu_item_id;
    END IF;

    IF v_available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for item % (ID: %). Requested quantity: %, Available: %.',
            v_item_name, NEW.menu_item_id, NEW.quantity, v_available_stock;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_stock
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION validate_stock();


CREATE OR REPLACE FUNCTION deduct_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stock
    SET quantity = quantity - NEW.quantity,
        last_update_date = CURRENT_TIMESTAMP
    WHERE item_id = NEW.menu_item_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION deduct_stock();


CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    v_old_status_name VARCHAR(50);
    v_new_status_name VARCHAR(50);
BEGIN
    --não faz nada se o status não mudou
    IF NEW.status_id = OLD.status_id THEN
        RETURN NEW;
    END IF;

    SELECT status_name INTO v_old_status_name FROM order_statuses WHERE id = OLD.status_id;
    SELECT status_name INTO v_new_status_name FROM order_statuses WHERE id = NEW.status_id;

    --pedido finalizado e entregue
    IF v_old_status_name = 'Delivered' AND v_new_status_name IN ('In Preparation', 'Pending', 'Ready for Delivery', 'In Delivery') THEN
        RAISE EXCEPTION 'Cannot change a delivered order back to "%" status.', v_new_status_name;
    END IF;

    --pedido cancelado
    IF v_old_status_name = 'Canceled' AND v_new_status_name NOT IN ('Canceled') THEN
        RAISE EXCEPTION 'Cannot reactivate a canceled order.';
    END IF;

    --status nao andam para tras
    IF v_old_status_name = 'In Delivery' AND v_new_status_name IN ('In Preparation', 'Pending', 'Ready for Delivery') THEN
        RAISE EXCEPTION 'An order in delivery cannot revert to a previous status.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_status_transition
BEFORE UPDATE OF status_id ON orders
FOR EACH ROW
EXECUTE FUNCTION validate_status_transition();


CREATE OR REPLACE FUNCTION log_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    v_canceled_status_id INTEGER;
    v_old_status_name VARCHAR(50);
BEGIN
    SELECT id INTO v_canceled_status_id FROM order_statuses WHERE status_name = 'Canceled';
    SELECT status_name INTO v_old_status_name FROM order_statuses WHERE id = OLD.status_id;

    IF NEW.status_id = v_canceled_status_id AND OLD.status_id IS DISTINCT FROM NEW.status_id THEN
        INSERT INTO logs (order_id, affected_table, action, notes)
        VALUES (NEW.id, 'orders', 'ORDER_CANCELED', FORMAT('Order %s canceled. Previous status: "%s".', NEW.id, v_old_status_name));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_cancellation
AFTER UPDATE OF status_id ON orders
FOR EACH ROW
EXECUTE FUNCTION log_cancellation();