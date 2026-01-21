import {NavLink} from "react-router";


const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors " +
    "text-slate-700 hover:text-slate-900 hover:bg-slate-100 "


export default function Home() {
    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <NavLink to="/svg" className={linkBase}>SVG</NavLink>
            <NavLink to="/canvas" className={linkBase}>Canvas</NavLink>
            <NavLink to="/logic1" className={linkBase}>Блок на 3 прокрута</NavLink>
            <NavLink to="/logic2" className={linkBase}>Убираем по 1</NavLink>
            <NavLink to="/battle" className={linkBase}>Сетка</NavLink>
        </div>
    );
}
