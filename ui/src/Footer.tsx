import { Container, Navbar, Row} from 'react-bootstrap';

const Footer = () => <Navbar className="fixed-bottom" bg="dark">
                <Container>
                <Row className="justify-content-md-center" style={{width: '100%'}}>
                    <p className='text-success'>&copy; Simon Lessenich, 2022</p>
                    </Row>
                </Container>
            </Navbar>

export default Footer;
