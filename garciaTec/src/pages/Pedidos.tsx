// src/pages/Pedidos.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

type Pedido = {
  id: number;
  customer_name: string;
  order_date: string;
  status: string;
  total_amount: string;
};

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/pedidos")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        );
        setPedidos(sorted);
      })
      .catch((err) => console.error("Erro ao buscar pedidos:", err));
  }, []);

  return (
    <>
      <Header></Header>
      <div className="px-14 pt-10 flex flex-col gap-2 items-center font-press min-h-screen">
        <h1 className="text-4xl font-bold mb-8 font-press text-primaryBrown-900">Lista de Pedidos</h1>
        <div className="grid gap-10 md:min-w-200 xl:min-w-300 text-1xl">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="p-6 border-8 border-primaryBrown-900 shadow-sm flex justify-between items-center"
            >
              <div className="text-neutral-800">
                <p><strong className="text-neutral-500">Cliente:</strong> {pedido.customer_name}</p>
                <p><strong>Status:</strong> {pedido.status}</p>
                <p><strong>Data:</strong> {new Date(pedido.order_date).toLocaleString()}</p>
                <p><strong>Total:</strong> R$ {pedido.total_amount}</p>
              </div>
              <button
                onClick={() =>
                    navigate(`/pedidos/${pedido.id}`)
                  }
                className="bg-primaryBrown-900 text-white px-6 py-2 hover:bg-amber-800 transition cursor-pointer"
              >
                Ver detalhes
              </button>
            </div>
          ))}
        </div>
      </div>
    <Footer></Footer>
    </>
  );
};

export default Pedidos;