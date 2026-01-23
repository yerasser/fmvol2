import Header from "../components/Header.jsx";
import Background from "../components/Background.jsx";
import VinylRecord from "../components/VinylRecord.jsx";


export default function Fortune() {

    return (
        <div className="max-h-screen overflow-hidden">
            <Background />
            <main className="flex flex-col items-center min-h-screen p-8">
                <Header />
                <VinylRecord />
            </main>
        </div>
    );
}
