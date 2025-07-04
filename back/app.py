from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import extras
import json
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

def get_db_connection():
    try:
        conn = psycopg2.connect(Config.DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

# --- ROTAS DA API ---

@app.route('/api/cardapio', methods=['GET'])
def get_cardapio():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, name, description, price, is_available FROM menu_items ORDER BY name;")
        itens = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(itens), 200
    except Exception as e:
        print(f"Erro ao buscar cardápio: {e}")
        return jsonify({"error": "Erro ao buscar itens do cardápio"}), 500

@app.route('/api/pedidos', methods=['GET'])
def listar_pedidos_api():
    status = request.args.get('status')
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        if status:
            cur.execute("SELECT * FROM list_orders(%s);", (status,))
        else:
            cur.execute("SELECT * FROM list_orders('%');") 
            
        pedidos = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(pedidos), 200
    except Exception as e:
        print(f"Erro ao listar pedidos: {e}")
        return jsonify({"error": "Erro ao listar pedidos"}), 500

@app.route('/api/pedidos', methods=['POST'])
def criar_novo_pedido():
    data = request.get_json()
    cliente_id = data.get('cliente_id')
    itens = data.get('itens') 

    if not all([cliente_id, itens]):
        return jsonify({"error": "Dados insuficientes para criar pedido. Requer 'cliente_id' e 'itens'."}), 400
    
    # Validação dos itens
    if not isinstance(itens, list) or not all(isinstance(item, dict) and 'menu_item_id' in item and 'quantity' in item for item in itens):
        return jsonify({"error": "Formato inválido para 'itens'. Espera uma lista de objetos com 'menu_item_id' e 'quantity'."}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500

    try:
        cur = conn.cursor()
        cur.execute("SELECT register_order(%s, %s::jsonb);", (cliente_id, json.dumps(itens)))
        novo_pedido_id = cur.fetchone()[0] # Captura o ID retornado pela função
        
        conn.commit() # Confirma a transação se tudo deu certo
        cur.close()
        conn.close()
        return jsonify({"message": "Pedido registrado com sucesso!", "pedido_id": novo_pedido_id}), 201
    except psycopg2.Error as db_err:
        conn.rollback()
        print(f"Erro de banco de dados ao registrar pedido: {db_err}")
        return jsonify({"error": str(db_err.pgerror).strip()}), 400
    except Exception as e:
        conn.rollback()
        print(f"Erro geral ao registrar pedido: {e}")
        return jsonify({"error": "Erro interno ao registrar pedido"}), 500

@app.route('/api/pedidos/<int:pedido_id>/status', methods=['PUT'])
def atualizar_status_pedido(pedido_id):
    data = request.get_json()
    novo_status = data.get('novo_status')

    if not novo_status:
        return jsonify({"error": "Novo status não fornecido"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500

    try:
        cur = conn.cursor()
        cur.execute("SELECT change_order_status(%s, %s);", (pedido_id, novo_status))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": f"Status do pedido {pedido_id} atualizado para {novo_status}"}), 200
    except psycopg2.Error as db_err:
        conn.rollback()
        print(f"Erro de banco de dados ao atualizar status: {db_err}")
        return jsonify({"error": str(db_err.pgerror).strip()}), 400
    except Exception as e:
        conn.rollback()
        print(f"Erro geral ao atualizar status: {e}")
        return jsonify({"error": "Erro interno ao atualizar status"}), 500

@app.route('/api/pedidos/<int:pedido_id>', methods=['GET'])
def get_detalhes_pedido(pedido_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT
                o.id AS pedido_id,
                o.customer_id,
                u.name AS customer_name,
                os.status_name AS status,
                o.order_date,
                o.expected_delivery_date,
                o.actual_delivery_date,
                o.total_amount,
                COALESCE(
                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'item_id', oi.menu_item_id,
                            'item_name', mi.name,
                            'quantity', oi.quantity,
                            'unit_price', oi.unit_price
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL), '[]'::jsonb
                ) AS order_items
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            JOIN order_statuses os ON o.status_id = os.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.id = %s
            GROUP BY o.id, u.name, os.status_name
        """, (pedido_id,))
        detalhes = cur.fetchone()
        cur.close()
        conn.close()

        if detalhes:
            return jsonify(detalhes), 200
        else:
            return jsonify({"message": "Pedido não encontrado"}), 404
    except Exception as e:
        print(f"Erro ao buscar detalhes do pedido: {e}")
        return jsonify({"error": "Erro ao buscar detalhes do pedido"}), 500


if __name__ == '__main__':
    app.run(debug=Config.DEBUG, port=5000)