import './App.css';
import Menu from './Menu';
import { useState } from 'react';
import Footer from './Footer';
import Overview from './Overview';
import { Week } from './WeekPicker';
import Projects from './Projects';
import Entries from './Entries';

const Pages = ["Overview", "Entries", "Projects"]

function App() {
    const [activePage, setActivePage] = useState(Pages[0])
    const [week, setWeek] = useState(new Week(""));

    function getPage() {
        switch (activePage) {
            case "Overview":
                return <Overview week={week} setWeek={setWeek} />
            case "Entries":
                return <Entries week={week} setWeek={setWeek} />
            case "Projects":
                return <Projects />
            default:
                return "Illegal state"
        }
    }

    return (
        <div className="App">
            <Menu changeMenu={s => setActivePage(s)} entries={Pages} isSelected={activePage} />
            {getPage()}
            <Footer />
        </div>
    );
}

export default App;
