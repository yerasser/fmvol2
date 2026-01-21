import Header from "../components/Header.jsx";
import VinylRecordCanvas from "../components/VinylRecordCanvas.jsx";
import Background from "../components/Background.jsx";
import VinylRecordLogic1 from "../components/VinylRecordLogic1.jsx";


export default function Logic1() {

    return (
        <div className="max-h-screen overflow-hidden">
            <Background />
            <main className="flex flex-col items-center min-h-screen p-8">
                <Header />
                <VinylRecordLogic1 />
            </main>
        </div>
    );
}
