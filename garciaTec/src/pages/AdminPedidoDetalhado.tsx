/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

const statusOptions = [
  "Pending",
  "In Preparation",
  "Delivered",
  "Canceled",
];

const AdminPedidoDetalhes = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/pedidos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPedido(data);
        setStatus(data.status); // Inicializa com o status atual
      })
      .catch((err) => console.error("Erro ao buscar detalhes do pedido:", err));
  }, [id]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoStatus = e.target.value;
    setStatus(novoStatus);

    try {
      const response = await fetch(`http://localhost:5000/api/pedidos/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novo_status: novoStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Erro ao atualizar status: " + errorData.error || response.statusText);
        setStatus(pedido.status); // Reverter para o status anterior
      } else {
        // Atualiza estado local do pedido também
        setPedido((prev: any) => ({ ...prev, status: novoStatus }));
      }
    } catch (error) {
      alert("Erro de rede ao atualizar status.");
      setStatus(pedido.status); // Reverter para o status anterior
      console.error(error);
    }
  };

  if (!pedido) return <div className="p-10 text-xl">Carregando...</div>;

  return (
    <>
      <Header />
      <div className="flex flex-col items-center pt-20 pb-40">
        <div className="border-8 p-10 border-primaryBrown-900 text-3xl max-w-4xl w-full">
          <h1 className="text-4xl font-bold mb-6">Detalhes do Pedido #{pedido.pedido_id}</h1>
          <p><strong>Cliente:</strong> {pedido.customer_name}</p>
          <p className="font-bold">
            <strong>Status:</strong>{" "}
            <select
              value={status}
              onChange={handleStatusChange}
              className="border border-gray-400 rounded px-2 py-1 text-xl"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </p>
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
      </div>
      <Footer />
    </>
  );
};

export default AdminPedidoDetalhes;