import {Route, Routes} from "react-router";
import Fortune from "./pages/Fortune.jsx";
import BattleTable from "./pages/BattleTable.jsx";
import Home from "./pages/Home.jsx";

export default function App() {

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/fortune' element={<Fortune />} />
            <Route path='/battle' element={<BattleTable />} />
        </Routes>
    );
}
