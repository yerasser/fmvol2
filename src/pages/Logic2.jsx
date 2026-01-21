import Header from "../components/Header.jsx";
import Background from "../components/Background.jsx";
import VinylRecordLogic2 from "../components/VinylRecordLogic2.jsx";



export default function Logic2() {

    return (
        <div className="max-h-screen overflow-hidden">
            <Background />
            <main className="flex flex-col items-center min-h-screen p-8">
                <Header />
                <VinylRecordLogic2 />
            </main>
        </div>
    );
}
