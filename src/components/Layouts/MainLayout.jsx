import Header from '../header/Header';
import Menu from '../menu/Menu';
import Footer from '../footer/Footer';

function MainLayout({ children }) {
    return (
    <>
    <Header />
    <Menu />
        <div className="main-content">
            {children}
        </div>
    <Footer />
    </>
    );
}

export default MainLayout;