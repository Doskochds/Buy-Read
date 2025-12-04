import { Outlet, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 

const Layout = () => {
    const navigate = useNavigate();
    
    const token = localStorage.getItem('jwt-token');
    const isLoggedIn = !!token;

    let isAdmin = false;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
            isAdmin = role === 'Admin';
        } catch (e) {
            console.error("Невалідний токен", e);
            isAdmin = false;
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('jwt-token');
        window.location.href = '/login'; 
    };

    return (
        <div className="app-container">
            <header style={styles.header}>
                <div className="logo">
                    <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                        <h2>📚 Buy&Read</h2>
                    </Link>
                </div>
                
                <nav style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/" style={styles.link}>Головна</Link>
                    <Link to="/catalog" style={styles.link}>Каталог</Link>

                    {isLoggedIn && (
                        <>
                            <Link to="/library" style={styles.link}>Мої книги</Link>

                            {isAdmin && (
                                <Link to="/admin/create" style={{...styles.link, color: '#ffc107'}}>+ Адмін</Link>
                            )}
                            {/* -------------------------------- */}
                        </>
                    )}

                    {isLoggedIn ? (
                         <button onClick={handleLogout} style={styles.logoutBtn}>Вихід</button>
                    ) : (
                        <Link to="/login" style={styles.link}>Вхід</Link>
                    )}
                </nav>
            </header>

            <main style={{ padding: '20px', minHeight: '80vh' }}>
                <Outlet />
            </main>

            <footer style={{ padding: '20px', background: '#f0f0f0', textAlign: 'center', color: '#666' }}>
                <p>© 2025 Buy&Read. Курсова робота.</p>
            </footer>
        </div>
    );
};

const styles = {
    header: {
        padding: '0 40px',
        height: '70px',
        background: '#282c34',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    link: {
        color: 'white',
        marginRight: '25px',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'opacity 0.2s'
    },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.5)',
        color: 'white',
        padding: '6px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    }
};

export default Layout;