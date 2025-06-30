
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import ListingItem from "../components/ListingItem";
import type { Product } from "../types/ProductType";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate } from "react-router";



function Cardapio() {

  const [products, setProducts] = useState<Product[]>([]);
  const [priceFilter, setPriceFilter] = useState<number>(99.99);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tempPriceFilter, setTempPriceFilter] = useState<number>(50);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const handleCheckboxChange = (id: number, isChecked: boolean) => {
    setSelectedIds((prev) =>
      isChecked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
    console.log(selectedIds);
  };


  const handleSubmitPedido = async () => {
    if (selectedIds.length === 0) {
      alert("sem items");
      return;
    }
  
    try {
      const payload = {
        cliente_id: 1,
        itens: selectedIds.map((id) => ({
          menu_item_id: id,
          quantity: 1,
        })),
      };
  
      const response = await fetch("http://localhost:5000/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert("foi porraaaaaaaa");
        setSelectedIds([]);
  
          navigate(`/pedidos/`);
      } else {
        alert("Erro ao enviar pedido: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert("Erro de rede ao enviar pedido.");
    }
  };
  


  const fetchProducts = async () => {
    try {
      const url = `http://localhost:5000/api/cardapio`;
      
      const response = await fetch(url);
      
      const responseText = await response.text();
      console.log("Response:", responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = JSON.parse(responseText); 
      let filtered = data;
      
      if (searchQuery) {
        filtered = filtered.filter((product : Product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      if(!isInitialLoad) {
        filtered = filtered.filter((product : Product) => parseFloat(product.price) <= priceFilter);
      }


      if(isInitialLoad) {
        const newMaxPrice = Math.ceil(Math.max(50, ...filtered.map((p: Product) => p.price)));
        setPriceFilter(newMaxPrice);
        setTempPriceFilter(newMaxPrice);
        setIsInitialLoad(false);
      }
      
      setProducts(filtered);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchProducts();
    }
  }, [searchQuery, priceFilter]);
 
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialLoad) {
        setPriceFilter(tempPriceFilter); 
      }
    }, 500); 
    
    return () => clearTimeout(timeout); 
  }, [tempPriceFilter]); 

  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row gap-4 px-14 pt-10 pb-10 justify-center items-center">
        <main className="flex flex-col justify-center items-center">
          <div className="flex flex-col lg:flex-row justify-center w-full">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-2xl px-5 py-3 border-primaryBrown-900 border-4 mb-4 max-h-13"
            />
          </div>
      
          {isInitialLoad ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-500">Carregando Produtos...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 py-5 xl:gap-25 md:gap-10 gap-10">
              {products.map((product) => (
                <ListingItem
                  key={product.id}
                  title={product.name}
                  label={product.is_available ? "Disponível" : "Sem Estoque"}
                  price={`$${product.price}`}
                  id={product.id}
                  checked={selectedIds.includes(product.id)}
                  onCheckboxChange={handleCheckboxChange}
                  description={product.description}

                />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 italic text-center mt-4">No products found</p>
          )}

          <div className="flex align-middle justify-center gap-2 px-2 py-15">
            <div className="flex gap-5 border rounded-md border-slate-200 h-10 w-50 justify-around align-middle items-center max-w-fit py-6 px-5">
            <button
  onClick={handleSubmitPedido}
  className="flex cursor-pointer justify-center items-center px-10 py-4 bg-primaryBrown-900 text-white text-5xl hover:bg-amber-800 transition-colors h-fit w-fit"
>
  FINALIZAR
</button>

            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};
  
export default Cardapio;