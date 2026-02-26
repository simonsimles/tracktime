import { Navbar, Container, Nav, Button } from 'react-bootstrap';

interface MenuProps {
    changeMenu: (selected: string) => void
    entries: string[]
    isSelected: string
    onLogout: () => void
}

const Menu = ({ changeMenu, entries, isSelected, onLogout }: MenuProps) => {
    return <Navbar bg='dark' variant='dark' fixed="top" sticky='top'>
        <Container fluid>
            <Navbar.Brand href='#home'>Tracktime</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    {entries.map(n =>
                        <Nav.Link
                            key={n}
                            onClick={_ => changeMenu(n)}
                            active={n === isSelected}>
                            {n}</Nav.Link>)
                    }
                </Nav>
                <Nav>
                    <Button 
                        variant="outline-light" 
                        size="sm"
                        onClick={onLogout}
                    >
                        Logout
                    </Button>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar >
}

export default Menu;
