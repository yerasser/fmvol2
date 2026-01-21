import Header from "./components/Header.jsx";
import VinylRecord from "./components/VinylRecord.jsx";
import Footer from "./components/Footer.jsx";
import Background from "./components/Background.jsx";


export default function App() {

    return (
        <div className="max-h-screen">
            <Background />
            <main className="flex flex-col items-center justify-between min-h-screen p-8">
                <Header />
                <VinylRecord />
                <Footer />
            </main>
        </div>
    );
}
