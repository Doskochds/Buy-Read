import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const BookPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    
    const isLoggedIn = !!localStorage.getItem('jwt-token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookResponse = await api.get(`/Books/${id}`);
                setBook(bookResponse.data);

                try {
                    const chaptersResponse = await api.get(`/Chapters/book/${id}`);
                    setChapters(chaptersResponse.data);
                } catch (err) {
                    setChapters([]);
                }
            } catch (error) {
                console.error("Помилка завантаження:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Завантаження...</div>;
    if (!book) return <div style={{textAlign: 'center', marginTop: '50px'}}>Книгу не знайдено</div>;

    const hasChapters = chapters.length > 0;

    return (
        <div style={styles.container}>
 
            <div style={styles.sidebar}>

                <div style={styles.coverWrapper}>
                    <div style={styles.coverPlaceholder}>
                        <span style={{fontSize: '50px', marginBottom: '10px'}}>📚</span>
                    </div>
                </div>

                <div style={styles.actionBlock}>
                    <div style={styles.priceRow}>
                        <span style={styles.priceLabel}>Вартість:</span>
                        <span style={styles.priceValue}>{book.price} ₴</span>
                    </div>
                    
                    <button style={styles.buyButton}>
                        Купити зараз
                    </button>
                </div>
            </div>

            <div style={styles.content}>
                
                <h1 style={styles.title}>{book.title}</h1>

                <div style={styles.tabs}>
                    <button 
                        style={activeTab === 'about' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('about')}
                    >
                        Про твір
                    </button>
                    
                    {hasChapters && (
                        <button 
                            style={activeTab === 'chapters' ? styles.tabActive : styles.tab}
                            onClick={() => setActiveTab('chapters')}
                        >
                            Глави <span style={styles.badge}>{chapters.length}</span>
                        </button>
                    )}

                    <button 
                        style={activeTab === 'comments' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('comments')}
                    >
                        Коментарі
                    </button>
                </div>

                {activeTab === 'about' && (
                    <div style={styles.tabContent}>

                        <div style={styles.descriptionBlock}>
                            <p>{book.description || "Опис відсутній..."}</p>
                        </div>

                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Автор:</span>
                                <span style={styles.infoValue}>{book.authorName}</span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Жанр:</span>
                                <span style={styles.infoValue}>{book.categoryName}</span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Мова:</span>
                                <span style={styles.infoValue}>Українська</span>
                            </div>
                        </div>

                        <div style={{marginTop: '25px', color: '#888', fontSize: '14px'}}>
                            <span style={styles.label}>Теги: </span>
                            <span style={{fontStyle: 'italic'}}>(функціонал у розробці)</span>
                        </div>
                    </div>
                )}

                {activeTab === 'chapters' && (
                    <div style={styles.tabContent}>
                        <div style={styles.chapterList}>
                            {chapters.map(chapter => (
                                <div key={chapter.id} style={styles.chapterItem}>
                                    <span>{chapter.title}</span>
                                    <span style={{fontSize: '0.8em', color: '#999'}}>🔒</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div style={styles.tabContent}>
                        {isLoggedIn ? (
                            <>
                                <textarea 
                                    placeholder="Написати коментар..." 
                                    style={styles.textArea}
                                />
                                <button style={styles.commentButton}>Надіслати</button>
                                <p style={{marginTop: '20px', color: '#777'}}>Коментарі поки відсутні.</p>
                            </>
                        ) : (
                            <div style={styles.loginPrompt}>
                                <p style={{marginBottom: '15px'}}>Щоб залишити коментар, потрібно увійти в акаунт.</p>
                                <button 
                                    style={styles.loginButton}
                                    onClick={() => navigate('/login')}
                                >
                                    Вхід
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 20px',
        gap: '50px', 
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    },
  
    sidebar: {
        width: '300px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px' 
    },
    coverWrapper: {
        width: '100%',
        aspectRatio: '2 / 3', 
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
    },
    coverPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ecf0f1'
    },
    actionBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 10px'
    },
    priceLabel: {
        fontSize: '18px',
        color: '#555'
    },
    priceValue: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#2c3e50'
    },
    buyButton: {
        padding: '16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        transition: 'background 0.2s',
        boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)' 
    },

    content: {
        flexGrow: 1,
        minWidth: '300px'
    },
    title: {
        margin: '0 0 30px 0',
        fontSize: '36px',
        color: '#2c3e50',
        lineHeight: '1.2'
    },
    tabs: {
        display: 'flex',
        gap: '30px',
        borderBottom: '2px solid #f0f0f0',
        marginBottom: '30px'
    },
    tab: {
        padding: '10px 0',
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '16px',
        color: '#95a5a6',
        cursor: 'pointer',
        borderBottom: '3px solid transparent',
        fontWeight: '500'
    },
    tabActive: {
        padding: '10px 0',
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '16px',
        color: '#2c3e50',
        fontWeight: 'bold',
        cursor: 'pointer',
        borderBottom: '3px solid #007bff',
        marginBottom: '-2px'
    },
    badge: {
        fontSize: '11px',
        backgroundColor: '#eee',
        color: '#555',
        padding: '2px 6px',
        borderRadius: '10px',
        marginLeft: '4px',
        verticalAlign: 'middle'
    },
    tabContent: {
        animation: 'fadeIn 0.3s ease-in-out'
    },
    descriptionBlock: {
        lineHeight: '1.8',
        fontSize: '16px',
        color: '#34495e',
        marginBottom: '40px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // Рівно 3 колонки
        gap: '20px',
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #eee'
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '12px',
        color: '#95a5a6',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    infoValue: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#2c3e50'
    },
    
    chapterList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0' 
    },
    chapterItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 10px',
        borderBottom: '1px solid #eee',
        color: '#2c3e50',
        transition: 'background 0.2s',
    },
    
    textArea: {
        width: '100%',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        minHeight: '100px',
        fontFamily: 'inherit',
        resize: 'vertical',
        fontSize: '16px'
    },
    commentButton: {
        marginTop: '15px',
        padding: '10px 25px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px'
    },
    loginPrompt: {
        padding: '40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#555',
        border: '1px dashed #ccc'
    },
    loginButton: {
        padding: '10px 30px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px'
    }
};

export default BookPage;