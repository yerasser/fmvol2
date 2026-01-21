import {Route, Routes} from "react-router";
import Svg from "./pages/Svg.jsx"
import Canvas from "./pages/Canvas.jsx";
import Logic1 from "./pages/Logic1.jsx";
import Logic2 from "./pages/Logic2.jsx";
import BattleTable from "./pages/BattleTable.jsx";
import Home from "./pages/Home.jsx";

export default function App() {

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/svg' element={<Svg />} />
            <Route path='/canvas' element={<Canvas />} />
            <Route path='/logic1' element={<Logic1 />} />
            <Route path='/logic2' element={<Logic2 />} />
            <Route path='/battle' element={<BattleTable />} />
        </Routes>
    );
}
