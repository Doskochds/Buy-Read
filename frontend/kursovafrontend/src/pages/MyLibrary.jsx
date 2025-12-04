import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import api from '../api/axios';

const MyLibrary = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const response = await api.get('/Orders/my-history');
                setOrders(response.data);
            } catch (error) {
                console.error(t('library.error_loading'), error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, [navigate, t]);

    const allBooks = orders.flatMap(order => order.items);

    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>{t('library.loading')}</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h1>{t('library.title')}</h1>

            {allBooks.length === 0 ? (
                <div style={{textAlign: 'center', color: '#777', marginTop: '50px'}}>
                    <p>{t('library.empty_text')}</p>
                    <button 
                        onClick={() => navigate('/catalog')}
                        style={styles.linkButton}
                    >
                        {t('library.catalog_btn')}
                    </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {allBooks.map((item, index) => (
                        <div key={index} style={styles.card}>
                            <div style={styles.cover}>📖</div>
                            
                            <div style={{padding: '15px'}}>
                                <h3>{item.bookTitle}</h3>
                                <p style={{color: '#666', fontSize: '0.9em'}}>{item.authorName}</p>
                                
                                <button 
                                    style={styles.readButton}
                                    onClick={() => navigate('/book/' + item.bookId)} 
                                >
                                    {t('library.read_btn')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' },
    card: { border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    cover: { height: '150px', background: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' },
    readButton: { width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    linkButton: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default MyLibrary;