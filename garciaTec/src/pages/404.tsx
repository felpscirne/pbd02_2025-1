import Header from "../components/Header";
import Fairy from "../assets/fairy.png";

function Page404() {
  return (
    <>
        <Header></Header>
        <div className="flex py-30 justify-center items-center">
            <img src={Fairy} width='760px' ></img>
        </div>
    </>
  )
}

export default Page404;