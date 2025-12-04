import { Outlet, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lang) => {
        if (i18n && i18n.changeLanguage) {
            i18n.changeLanguage(lang);
        } else {
            console.error("i18n не ініціалізовано коректно");
        }
    };

    return (
        <div style={styles.switcherContainer}>
            <button 
                onClick={() => changeLanguage('uk')} 
                style={styles.btn(i18n.language === 'uk')}
                title="Українська"
            >
                🇺🇦
            </button>
            <button 
                onClick={() => changeLanguage('en')} 
                style={styles.btn(i18n.language === 'en')}
                title="English"
            >
                en
            </button>
            <button 
                onClick={() => changeLanguage('es')} 
                style={styles.btn(i18n.language === 'es')}
                title="Español"
            >
                🇪🇸
            </button>
        </div>
    );
};

const Layout = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('jwt-token');
    const isLoggedIn = !!token;
    const { t } = useTranslation();

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
                    <Link to="/" style={styles.link}>{t("layout.home")}</Link>
                    <Link to="/catalog" style={styles.link}>{t("layout.catalog")}</Link>

                    {isLoggedIn && (
                        <>
                            <Link to="/library" style={styles.link}>{t("layout.my_books")}</Link>

                            {isAdmin && (
                                <Link to="/admin/create" style={{...styles.link, color: '#ffc107'}}>+ {t("layout.admin")}</Link>
                            )}
                        </>
                    )}

                    {isLoggedIn ? (
                         <button onClick={handleLogout} style={styles.logoutBtn}>{t("layout.logout")}</button>
                    ) : (
                        <Link to="/login" style={styles.link}>{t("layout.login")}</Link>
                    )}

                    <LanguageSwitcher />
                </nav>
            </header>

            <main style={{ padding: '20px', minHeight: '80vh' }}>
                <Outlet />
            </main>

            <footer style={{ padding: '20px', background: '#f0f0f0', textAlign: 'center', color: '#666' }}>
                <p>© 2025 Buy&Read. {t("layout.footer")}</p>
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1000
    },
    switcherContainer: {
        display: 'flex', 
        gap: '8px', 
        marginLeft: '20px',
        alignItems: 'center'
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
    },
    btn: (isActive) => ({
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '24px',
        lineHeight: '1',
        color: 'white',
        opacity: isActive ? 1 : 0.4,
        filter: isActive ? 'none' : 'grayscale(100%)',
        transition: 'all 0.3s ease',
        padding: '0 4px',
        outline: 'none'
    })
};

export default Layout;
export { LanguageSwitcher };
