import Header from '../header/Header';
import Menu from '../menu/Menu';
import Footer from '../footer/Footer';
import { useTheme } from 'next-themes';

function MainLayout({ children }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
    <>
    <Header />
    <Menu />
        <div className={`main-content${isDark ? ' dark' : ''}`}>
            {children}
        </div>
    <Footer />
    </>
    );
}

export default MainLayout;