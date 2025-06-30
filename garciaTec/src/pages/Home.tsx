import Header from "../components/Header";
import SplitText from "../components/SplitText";
import Hamburger from "../assets/hamburger.png";
import { ButtonLink } from "../components/Button";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Header></Header>
      <main className="h-cover w-full flex items-center align-middle justify-center pt-30 flex-col gap-2">
        <SplitText
            text="Bem"
            className="text-7xl font-semibold text-center text-primaryBrown-900 font-press"
            delay={100}
            duration={2}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-200px"
            textAlign="center"
        />
        <SplitText
            text="Vindo"
            className="text-7xl font-semibold text-center text-primaryBrown-900 font-press"
            delay={500}
            duration={2}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-200px"
            textAlign="center"
        />
        <div className="p-1 mt-3 flex items-center justify-center animate-bounce pt-10" style={{ animationDuration: "2s" }}>
          <img src={Hamburger} width={300}></img>
        </div>
        <div className="flex gap-10 mb-30">

          <ButtonLink to="/cardapio" text="Cardapio"></ButtonLink>
          <ButtonLink to="/pedidos" text="Pedidos"></ButtonLink>

        </div>

      </main>
      <Footer></Footer>
    </>
  )

}

export default Home;