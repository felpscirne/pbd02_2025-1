import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css';
import Home from "./pages/Home.tsx";
import Pedidos from './pages/Pedidos.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pedidos" element={<Pedidos />} />
    </Routes>
  </BrowserRouter>
);
