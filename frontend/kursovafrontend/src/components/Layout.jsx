import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="app-container">
            <header style={{ padding: '20px', background: '#282c34', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                <div className="logo">
                    <h2>📚 Buy&Read</h2>
                </div>
                <nav>
                    <Link to="/" style={{ color: 'white', marginRight: '15px' }}>Головна</Link>
                    <Link to="/catalog" style={{ color: 'white', marginRight: '15px' }}>Каталог</Link>
                    <Link to="/login" style={{ color: 'white' }}>Вхід</Link>
                </nav>
            </header>

            <main style={{ padding: '20px', minHeight: '80vh' }}>
                
                <Outlet />
            </main>

            <footer style={{ padding: '10px', background: '#f0f0f0', textAlign: 'center' }}>
                <p>© 2025 Buy&Read. Курсова робота.</p>
            </footer>
        </div>
    );
};

export default Layout;