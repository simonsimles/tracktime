import './App.css';
import Menu from './Menu';
import { useState, useEffect } from 'react';
import Footer from './Footer';
import Overview from './Overview';
import { Week } from './WeekPicker';
import Projects from './Projects';
import Entries from './Entries';
import MonthView from './MonthView';
import { Month } from './MonthPicker';
import { getWeekFromDate } from './Date';
import { LoginPage } from './components/LoginPage';
import { authService } from './AuthService';

const Pages = ["Overview", "Entries", "Projects", "MonthView"]

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [activePage, setActivePage] = useState(Pages[0])
    const [week, setWeek] = useState(new Week(""));

    useEffect(() => {
        // Check authentication on component mount
        setIsAuthenticated(authService.isAuthenticated());
        
        // Start periodic token check when page is visible
        authService.startPeriodicCheck();

        // Handle page visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // User returned to the app - check if token is still valid
                if (!authService.isTokenValid()) {
                    setIsAuthenticated(false);
                }
                // Start periodic check when page becomes visible
                authService.startPeriodicCheck();
            } else {
                // User switched to another tab/window - stop periodic check
                authService.stopPeriodicCheck();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup function
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            authService.stopPeriodicCheck();
        };
    }, [])

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

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="App">
            <Menu 
                changeMenu={s => setActivePage(s)} 
                entries={Pages} 
                isSelected={activePage}
                onLogout={() => {
                    authService.clearToken();
                    setIsAuthenticated(false);
                }}
            />
            {getPage()}
            <Footer />
        </div>
    );
}

export default App;
