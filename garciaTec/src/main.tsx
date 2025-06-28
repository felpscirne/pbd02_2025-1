import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css';
import Home from "./pages/Home.tsx";
import Pedidos from './pages/Pedidos.tsx';
import Page404 from './pages/404.tsx';
import Cardapio from './pages/Cardapio.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pedidos" element={<Pedidos/>} />
      <Route path="/*" element={<Page404/>} />
      <Route path="/cardapio" element={<Cardapio/>} />    
      
    </Routes>
  </BrowserRouter>
);
