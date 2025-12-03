import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MyLibrary = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const response = await api.get('/Orders/my-history');
                setOrders(response.data);
            } catch (error) {
                console.error("Помилка завантаження бібліотеки:", error);
                // Якщо токен протух або його немає - на логін
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, [navigate]);

    // --- ЛОГІКА ВІДОБРАЖЕННЯ ---
    // API повертає Замовлення, в яких є Товари (Items).
    // Нам треба дістати всі книги з усіх замовлень в один плоский список.
    const allBooks = orders.flatMap(order => order.items);

    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Завантаження бібліотеки...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h1>Моя бібліотека</h1>

            {allBooks.length === 0 ? (
                <div style={{textAlign: 'center', color: '#777', marginTop: '50px'}}>
                    <p>Ви ще нічого не купили.</p>
                    <button 
                        onClick={() => navigate('/catalog')}
                        style={styles.linkButton}
                    >
                        Перейти до каталогу
                    </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {allBooks.map((item, index) => (
                        <div key={index} style={styles.card}>
                            {/* Іконка книги */}
                            <div style={styles.cover}>📖</div>
                            
                            <div style={{padding: '15px'}}>
                                <h3>{item.bookTitle}</h3>
                                <p style={{color: '#666', fontSize: '0.9em'}}>{item.authorName}</p>
                                
                                <button 
                                    style={styles.readButton}
                                    onClick={() => Maps('/book/' + item.bookId)} 
                                >
                                    Читати
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