import Header from "../components/Header.jsx";
import VinylRecordCanvas from "../components/VinylRecordCanvas.jsx";
import Background from "../components/Background.jsx";


export default function Canvas() {

    return (
        <div className="max-h-screen overflow-hidden">
            <Background />
            <main className="flex flex-col items-center min-h-screen p-8">
                <Header />
                <VinylRecordCanvas />
            </main>
        </div>
    );
}
