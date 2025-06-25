# back/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import extras # Para usar o RealDictCursor
import json # Para lidar com JSON para as stored procedures
from config import Config # Importa a classe de configuração

app = Flask(__name__)
app.config.from_object(Config) # Carrega as configurações da classe Config

# Configura o CORS para permitir requisições do seu frontend React.
# Permite todos os métodos (GET, POST, PUT, etc.) e cabeçalhos em todas as rotas de /api/
CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

def get_db_connection():
    """
    Função para estabelecer a conexão com o banco de dados PostgreSQL.
    Utiliza a URL de conexão definida em config.py.
    """
    try:
        conn = psycopg2.connect(Config.DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        # Em um ambiente de produção, você pode querer logar isso e não retornar None,
        # mas lançar uma exceção ou ter um tratamento mais robusto.
        return None

# --- ROTAS DA API ---

@app.route('/api/cardapio', methods=['GET'])
def get_cardapio():
    """
    Retorna todos os itens do cardápio.
    """
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500
    try:
        # Usa RealDictCursor para retornar linhas como dicionários, facilitando a conversão para JSON.
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
    """
    Lista pedidos, opcionalmente filtrando por status.
    Chama a função list_orders do PostgreSQL.
    """
    status = request.args.get('status') # Obtém o parâmetro 'status' da URL (ex: /api/pedidos?status=Pending)
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        if status:
            # Sua função list_orders no PG espera o nome do status.
            cur.execute("SELECT * FROM list_orders(%s);", (status,))
        else:
            # Se nenhum status for fornecido, você pode listar todos (se sua função PG permitir NULL)
            # Ou retornar um erro, dependendo da sua regra de negócio.
            # No seu SQL, list_orders espera um LIKE, então NULL não funcionaria bem.
            # Se quiser listar todos, crie uma função PG sem parâmetro, ou adapte esta.
            # Por simplicidade, vamos exigir status por enquanto, ou adaptar para um status padrão.
            # Para o momento, se status é None, retornaremos todos (assumindo que sua list_orders pode lidar com p_status_name IS NULL ou '%').
            # Se não, descomente a linha abaixo e remova a que chama com NULL.
            # return jsonify({"error": "Parâmetro 'status' é obrigatório."}), 400
            cur.execute("SELECT * FROM list_orders('%');") # Lista todos se a função PG usar ILIKE '%'
            
        pedidos = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(pedidos), 200
    except Exception as e:
        print(f"Erro ao listar pedidos: {e}")
        return jsonify({"error": "Erro ao listar pedidos"}), 500

@app.route('/api/pedidos', methods=['POST'])
def criar_novo_pedido():
    """
    Cria um novo pedido com os itens fornecidos.
    Chama a stored procedure register_order do PostgreSQL.
    """
    data = request.get_json()
    cliente_id = data.get('cliente_id')
    itens = data.get('itens') # Lista de dicionários: [{"menu_item_id": 1, "quantity": 2}, ...]

    if not all([cliente_id, itens]):
        return jsonify({"error": "Dados insuficientes para criar pedido. Requer 'cliente_id' e 'itens'."}), 400
    
    # Validação básica dos itens (pode ser mais robusta)
    if not isinstance(itens, list) or not all(isinstance(item, dict) and 'menu_item_id' in item and 'quantity' in item for item in itens):
        return jsonify({"error": "Formato inválido para 'itens'. Espera uma lista de objetos com 'menu_item_id' e 'quantity'."}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500

    try:
        cur = conn.cursor()
        
        cur.execute("CALL register_order(%s, %s::jsonb);", (cliente_id, json.dumps(itens)))
        

        conn.commit() # Confirma a transação se tudo deu certo
        cur.close()
        conn.close()
        return jsonify({"message": "Pedido registrado com sucesso!"}), 201
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
        # Consulta para obter detalhes do pedido e agregar os itens relacionados.
        # Assumindo que 'users' tem 'name' e 'order_statuses' tem 'status_name'
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

# Rota para logar usuários (exemplo, você precisará implementar a lógica de autenticação)
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Falha ao conectar ao banco de dados"}), 500

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("SELECT id, name, email, password, user_type FROM users WHERE email = %s;", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            
            if user['password'] == password: 
                 return jsonify({"message": "Login bem-sucedido", "user": {"id": user['id'], "name": user['name'], "user_type": user['user_type']}}), 200
            else:
                 return jsonify({"error": "Credenciais inválidas"}), 401

        return jsonify({"error": "Credenciais inválidas"}), 401
    except Exception as e:
        print(f"Erro durante o login: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500



if __name__ == '__main__':
    
    app.run(debug=Config.DEBUG, port=5000)