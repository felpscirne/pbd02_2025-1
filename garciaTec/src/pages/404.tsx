import Header from "../components/Header";
import Fairy from "../assets/fairy.png";
import Footer from "../components/Footer";

function Page404() {
  return (
    <>
    <Header></Header>
    <main className="md:min-h-200 min-h-112 flex flex-col">
      <div className="flex justify-center items-end relative">
        <img src={Fairy} width="760px" className="absolute md:top-34 top-14"/>
      </div>
    </main>
    <Footer />



    </>
  )
}

export default Page404;