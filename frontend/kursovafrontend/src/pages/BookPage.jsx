import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const API_BASE_URL = "https://localhost:7025"; 

const BookPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [book, setBook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const isLoggedIn = !!localStorage.getItem('jwt-token');
    const [accessInfo, setAccessInfo] = useState(null); 
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookResponse = await api.get(`/Books/${id}`);
                setBook(bookResponse.data);

                if (isLoggedIn) {
                    try {
                        const readResponse = await api.get(`/Books/${id}/read`);
                        setAccessInfo(readResponse.data); 
                        setHasAccess(true);
                    } catch (err) {
                        setHasAccess(false);
                    }
                }

                try {
                    const chaptersResponse = await api.get(`/Chapters/book/${id}`);
                    setChapters(chaptersResponse.data);
                } catch (err) {
                    setChapters([]); 
                }

                try {
                    const commentsResponse = await api.get(`/Comments/book/${id}`);
                    setComments(commentsResponse.data);
                } catch (err) {
                    setComments([]);
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isLoggedIn]);

    const handleBuy = async () => {
        if (!isLoggedIn) return navigate('/login');
        if (window.confirm(`Купити книгу "${book.title}" за ${book.price} грн?`)) {
            try {
                await api.post('/Orders/buy', { bookIds: [book.id] });
                alert("Покупка успішна!");
                window.location.reload(); 
            } catch (err) {
                alert("Помилка покупки: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleRead = () => {
        if (!hasAccess) return;

        if (chapters.length > 0) {
            navigate(`/read/${chapters[0].id}`);
        } else {
            navigate(`/read/${id}?type=file`);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await api.get(`/Books/${id}/download`, { responseType: 'blob' });
            
            let extension = "pdf";
            if (response.data.type === "text/plain") extension = "txt";

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${book.title}.${extension}`); 
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert("Помилка при скачуванні файлу");
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmittingComment(true);
        try {
            await api.post('/Comments', { bookId: id, text: newComment });
            setNewComment('');
            
            const commentsResponse = await api.get(`/Comments/book/${id}`);
            setComments(commentsResponse.data);
        } catch (error) {
            alert("Не вдалося додати коментар");
        } finally {
            setSubmittingComment(false);
        }
    };

    const getCoverUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path}`;
    };

    const isFileBook = chapters.length === 0;

    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Завантаження...</div>;
    if (!book) return <div style={{textAlign: 'center', marginTop: '50px'}}>Книгу не знайдено</div>;

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.coverWrapper}>
                    {book.coverImagePath && (
                         <img 
                            src={getCoverUrl(book.coverImagePath)} 
                            alt={book.title} 
                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                            onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} 
                         />
                    )}
                    <div style={{...styles.coverPlaceholder, display: book.coverImagePath ? 'none' : 'flex'}}>
                        <span style={{fontSize: '50px', marginBottom: '10px'}}>📚</span>
                    </div>
                </div>

                <div style={styles.actionBlock}>
                    <div style={styles.priceRow}>
                        <span style={styles.priceLabel}>Вартість:</span>
                        <span style={styles.priceValue}>{book.price} ₴</span>
                    </div>
                    
                    {!hasAccess ? (
                        <button style={styles.buyButton} onClick={handleBuy}>Купити зараз</button>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            <button style={styles.readButton} onClick={handleRead}>📖 Читати</button>
                            {isFileBook && (
                                <button style={styles.downloadButton} onClick={handleDownload}>⬇️ Завантажити файл</button>
                            )}
                        </div>
                    )}
                    {hasAccess && isFileBook && (
                         <small style={{textAlign: 'center', color: '#666', fontSize: '12px'}}>
                             Формат: Цілий файл
                         </small>
                    )}
                </div>
            </div>

            <div style={styles.content}>
                <h1 style={styles.title}>{book.title}</h1>
                <div style={styles.tabs}>
                    <button style={activeTab === 'about' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('about')}>Про твір</button>
                    {!isFileBook && (
                        <button style={activeTab === 'chapters' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('chapters')}>
                            Зміст <span style={styles.badge}>{chapters.length}</span>
                        </button>
                    )}
                    <button style={activeTab === 'comments' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('comments')}>
                        Коментарі <span style={styles.badge}>{comments.length}</span>
                    </button>
                </div>

                {activeTab === 'about' && (
                    <div style={styles.tabContent}>
                        <div style={styles.descriptionBlock}><p>{book.description || "Опис відсутній..."}</p></div>
                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}><span style={styles.label}>Автор:</span><span style={styles.infoValue}>{book.authorName}</span></div>
                            <div style={styles.infoItem}><span style={styles.label}>Жанр:</span><span style={styles.infoValue}>{book.categoryName}</span></div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Тип:</span>
                                <span style={styles.infoValue}>
                                    {isFileBook ? "Цілий твір (Файл)" : "Розділений твір (Глави)"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'chapters' && !isFileBook && (
                    <div style={styles.tabContent}>
                        <div style={styles.chapterList}>
                            {chapters.length > 0 ? chapters.map(chapter => (
                                <div key={chapter.id} style={styles.chapterItem}>
                                    <span>{chapter.title}</span>
                                    {hasAccess ? (
                                        <button style={styles.smallReadBtn} onClick={() => navigate(`/read/${chapter.id}`)}>Читати</button>
                                    ) : (<span style={{fontSize: '0.8em', color: '#999'}}>🔒</span>)}
                                </div>
                            )) : <p style={{color: '#777'}}>Зміст поки порожній.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div style={styles.tabContent}>
                        <div style={styles.commentFormBlock}>
                            {isLoggedIn ? (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px'}}>
                                    <textarea 
                                        style={styles.textArea} 
                                        rows="3" 
                                        placeholder="Напишіть ваш відгук..." 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button 
                                        style={styles.submitBtn} 
                                        onClick={handleAddComment} 
                                        disabled={submittingComment || !newComment.trim()}
                                    >
                                        {submittingComment ? 'Відправка...' : 'Залишити коментар'}
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.loginPrompt}>
                                    <p>Увійдіть в акаунт, щоб залишати коментарі</p>
                                    <button style={styles.loginBtn} onClick={() => navigate('/login')}>Увійти</button>
                                </div>
                            )}
                        </div>

                        {comments.length > 0 ? (
                            <div style={styles.commentList}>
                                {comments.map(comment => (
                                    <div key={comment.id} style={styles.commentItem}>
                                        <div style={styles.commentHeader}>
                                            <span style={styles.commentUser}>{comment.userName || "Користувач"}</span>
                                            <span style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p style={styles.commentText}>{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{textAlign: 'center', padding: '20px', color: '#777'}}>
                                <p>Ще немає коментарів. Будьте першим!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' },
    sidebar: { width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' },
    coverWrapper: { width: '100%', aspectRatio: '2 / 3', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', position: 'relative', backgroundColor: '#eee' },
    coverPlaceholder: { width: '100%', height: '100%', backgroundColor: '#2c3e50', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ecf0f1', position: 'absolute', top: 0, left: 0 },
    actionBlock: { display: 'flex', flexDirection: 'column', gap: '15px' },
    priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' },
    priceLabel: { fontSize: '18px', color: '#555' },
    priceValue: { fontSize: '28px', fontWeight: '800', color: '#2c3e50' },
    buyButton: { padding: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)' },
    readButton: { padding: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)' },
    downloadButton: { padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', width: '100%' },
    content: { flexGrow: 1, minWidth: '300px' },
    title: { margin: '0 0 30px 0', fontSize: '36px', color: '#2c3e50', lineHeight: '1.2' },
    tabs: { display: 'flex', gap: '30px', borderBottom: '2px solid #f0f0f0', marginBottom: '30px' },
    tab: { padding: '10px 0', border: 'none', backgroundColor: 'transparent', fontSize: '16px', color: '#95a5a6', cursor: 'pointer', borderBottom: '3px solid transparent', fontWeight: '500' },
    tabActive: { padding: '10px 0', border: 'none', backgroundColor: 'transparent', fontSize: '16px', color: '#2c3e50', fontWeight: 'bold', cursor: 'pointer', borderBottom: '3px solid #007bff', marginBottom: '-2px' },
    badge: { fontSize: '11px', backgroundColor: '#eee', color: '#555', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px', verticalAlign: 'middle' },
    tabContent: { animation: 'fadeIn 0.3s ease-in-out' },
    descriptionBlock: { lineHeight: '1.8', fontSize: '16px', color: '#34495e', marginBottom: '40px' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '12px', border: '1px solid #eee' },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '12px', color: '#95a5a6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoValue: { fontSize: '16px', fontWeight: '500', color: '#2c3e50' },
    chapterList: { display: 'flex', flexDirection: 'column', gap: '0' },
    chapterItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 10px', borderBottom: '1px solid #eee', color: '#2c3e50' },
    smallReadBtn: { padding: '5px 15px', backgroundColor: '#fff', border: '1px solid #28a745', color: '#28a745', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    commentList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    commentItem: { padding: '15px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' },
    commentHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' },
    commentUser: { fontWeight: 'bold', color: '#2c3e50' },
    commentDate: { color: '#95a5a6' },
    commentText: { margin: 0, color: '#444', lineHeight: '1.5' },
    commentFormBlock: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' },
    textArea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' },
    submitBtn: { alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    loginPrompt: { padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    loginBtn: { padding: '8px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }
};

export default BookPage;