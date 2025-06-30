/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/PedidoDetalhes.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const PedidoDetalhes = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/pedidos/${id}`)
      .then((res) => res.json())
      .then((data) => setPedido(data))
      .catch((err) => console.error("Erro ao buscar detalhes do pedido:", err));
  }, [id]);

  if (!pedido) return <div className="p-10 text-xl">Carregando...</div>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Detalhes do Pedido #{pedido.pedido_id}</h1>
      <p><strong>Cliente:</strong> {pedido.customer_name}</p>
      <p><strong>Status:</strong> {pedido.status}</p>
      <p><strong>Data do pedido:</strong> {new Date(pedido.order_date).toLocaleString()}</p>
      <p><strong>Valor total:</strong> R$ {pedido.total_amount}</p>
      <h2 className="mt-6 text-xl font-semibold">Itens:</h2>
      <ul className="mt-2 list-disc list-inside">
        {pedido.order_items.map((item: any, index: number) => (
          <li key={index}>
            {item.quantity}x {item.item_name} - R$ {item.unit_price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PedidoDetalhes;