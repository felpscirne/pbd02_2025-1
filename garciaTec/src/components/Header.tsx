import { Link } from 'react-router';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className='w-full'>
        <header className="flex md:justify-between justify-center py-8 lg:px-65 px-25 items-center align-middle bg-primaryBrown-900">
          <div className='flex lg:gap-40 gap-20 align-middle items-center'>
              <div className='flex gap-4 items-center'>
                <div className="font-press font-[900] text-5xl text-white">GARCIA</div>
              </div>
              <nav className='text-primaryOffYellow hidden gap-10 md:visible md:flex lg:mr-10 text-4xl ml-10'>
                <Link className='hover:font-[900]' to={'/'}>Home</Link>
                <Link className='hover:font-[800]' to={'/Cardapio'}>Cardapio</Link>
                <Link className='hover:font-[800]' to={'/pedidos'}>Pedidos</Link>
              </nav>
          </div>

            <div className='md:flex hidden gap-8 ml-5'>
            </div>

            <button 
            className="md:hidden p-2 rounded-md focus:outline-none ml-2 z-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={40} color='white' /> : <Menu size={40} color='white' />}
          </button>


          {menuOpen && (
        <nav className="md:hidden bg-primaryBrown-900 text-white absolute left-0 top-20 w-full py-5 px-10 flex justify-center gap-10 transition-all z-100 text-4xl ease-in-out">
          <Link to={'/home'} onClick={() => setMenuOpen(false)} className='hover:text-neutral-900 hover:font-[600]'>Home</Link>
          <Link to={'/cardapio'} onClick={() => setMenuOpen(false)} className='hover:text-neutral-900 hover:font-[600]' >Pedidos</Link>
          <Link to={'/about'} onClick={() => setMenuOpen(false)} className='hover:text-neutral-900 hover:font-[600]'>Cardapio</Link>
        </nav>
      )}

        </header>
    </div>
  )
}

export default Header;