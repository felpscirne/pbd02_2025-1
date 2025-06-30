import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

type PedidoItem = {
  menu_item_name: string;
  quantity: number;
  price: number;
};

type PedidoDetails = {
  id: number;
  customer_name: string;
  order_date: string;
  status: string;
  total_amount: string;
  items?: PedidoItem[];
};

export default function PedidoModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pedidos/${id}`);
        const data = await res.json();
        setPedido(data);
      } catch (err) {
        console.error("Failed to fetch pedido", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg text-xl">Carregando...</div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg text-xl">
          Pedido não encontrado
          <button
            className="mt-4 block text-blue-600 underline"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl relative">
        <h2 className="text-2xl font-bold mb-4">Detalhes do Pedido #{pedido.id}</h2>
        <p><strong>Cliente:</strong> {pedido.customer_name}</p>
        <p><strong>Status:</strong> {pedido.status}</p>
        <p><strong>Data:</strong> {new Date(pedido.order_date).toLocaleString()}</p>
        <p><strong>Total:</strong> R$ {pedido.total_amount}</p>

        {pedido.items?.length ? (
          <>
            <h3 className="text-xl font-semibold mt-4 mb-2">Itens:</h3>
            <ul className="list-disc list-inside text-lg">
              {pedido.items.map((item, index) => (
                <li key={index}>
                  {item.menu_item_name} — {item.quantity}x @ R$ {item.price}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="italic mt-2">Nenhum item listado</p>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-5 py-2 bg-primaryBrown-900 text-white hover:bg-amber-800 transition rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
