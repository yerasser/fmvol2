import Header from "../components/Header.jsx";
import VinylRecordSvg from "../components/VinylRecordSvg.jsx";
import Background from "../components/Background.jsx";


export default function Svg() {

    return (
        <div className="max-h-screen overflow-hidden">
            <Background />
            <main className="flex flex-col items-center min-h-screen p-8">
                <Header />
                <VinylRecordSvg />
            </main>
        </div>
    );
}
