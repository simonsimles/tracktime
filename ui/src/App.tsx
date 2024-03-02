import './App.css';
import Menu from './Menu';
import { useState } from 'react';
import Footer from './Footer';
import Overview from './Overview';
import { Week } from './WeekPicker';
import Projects from './Projects';
import Entries from './Entries';
import MonthView from './MonthView';
import { Month } from './MonthPicker';
import { getWeekFromDate } from './Date';

const Pages = ["Overview", "Entries", "Projects", "MonthView"]

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
            case "MonthView":
                return <MonthView month={new Month(week.getThursday().getFullYear(), week.getThursday().getMonth()+1)} setMonth={m => setWeek(new Week(m.getFirstDay().getFullYear(), getWeekFromDate(m.getFirstDay())))} />
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
