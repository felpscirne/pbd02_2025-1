/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/PedidoDetalhes.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    <>
        <Header></Header>
        <div className="flex flex-col items-center pt-20 pb-40">
            <div className="border-8 p-10 border-primaryBrown-900 text-3xl">
            <h1 className="text-4xl font-bold mb-6">Detalhes do Pedido #{pedido.pedido_id}</h1>
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
                ))} </ul>

            </div>
        </div>
        <Footer></Footer>
    </>
  );
};

export default PedidoDetalhes;