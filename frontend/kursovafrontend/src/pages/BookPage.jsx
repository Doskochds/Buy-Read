import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Імпорт i18n
import api from '../api/axios';

const API_BASE_URL = "https://localhost:7025"; 

const BookPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Дані книги
    const [book, setBook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    
    // Стан для форми коментарів
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5); 
    const [submittingComment, setSubmittingComment] = useState(false);

    // Авторизація та доступ
    const isLoggedIn = !!localStorage.getItem('jwt-token');
    const [accessInfo, setAccessInfo] = useState(null); 
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Книга
                const bookResponse = await api.get(`/Books/${id}`);
                setBook(bookResponse.data);

                // 2. Доступ (читання)
                // ЛОГІКА ЗБЕРЕЖЕНА: Перевіряємо доступ через окремий запит
                if (isLoggedIn) {
                    try {
                        const readResponse = await api.get(`/Books/${id}/read`);
                        setAccessInfo(readResponse.data); 
                        setHasAccess(true); // Якщо запит успішний - книга куплена
                    } catch (err) {
                        setHasAccess(false); // Якщо помилка (403/404) - книга не куплена
                    }
                }

                // 3. Глави
                try {
                    const chaptersResponse = await api.get(`/Chapters/book/${id}`);
                    setChapters(chaptersResponse.data);
                } catch (err) {
                    setChapters([]); 
                }

                // 4. Коментарі
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
        
        // Використовуємо t() з параметрами для повідомлення
        const confirmMessage = t('book.buy_confirm_message', { 
            title: book.title, 
            price: book.price 
        });

        if (window.confirm(confirmMessage)) {
            try {
                await api.post('/Orders/buy', { bookIds: [book.id] });
                alert(t('book.buy_success'));
                window.location.reload(); // Перезавантаження оновить useEffect і перевірить доступ
            } catch (err) {
                alert(t('book.buy_error') + " " + (err.response?.data?.message || err.message));
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
            alert(t('book.download_error'));
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmittingComment(true);
        try {
            await api.post('/Comments', { 
                bookId: id,     
                text: newComment, 
                rating: newRating 
            });
            
            setNewComment('');
            setNewRating(10);

            const commentsResponse = await api.get(`/Comments/book/${id}`);
            setComments(commentsResponse.data);
        } catch (error) {
            alert(t('book.comment_error'));
        } finally {
            setSubmittingComment(false);
        }
    };

    const renderStars = (rating, interactive = false) => {
        return [...Array(10)].map((_, i) => {
            const starValue = i + 1;
            const isActive = starValue <= rating;
            return (
                <span 
                    key={i} 
                    style={{
                        color: isActive ? '#ffc107' : '#e4e5e9', 
                        cursor: interactive ? 'pointer' : 'default',
                        fontSize: interactive ? '24px' : '18px',
                        marginRight: '2px'
                    }}
                    onClick={interactive ? () => setNewRating(starValue) : undefined}
                >
                    ★
                </span>
            );
        });
    };

    const getCoverUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path}`;
    };

    const isFileBook = chapters.length === 0;

    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>{t('common.loading')}</div>;
    if (!book) return <div style={{textAlign: 'center', marginTop: '50px'}}>{t('catalog.nothing_found')}</div>;

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
                        <span style={styles.priceLabel}>{t('book.price_label')}</span>
                        <span style={styles.priceValue}>{book.price} {t('common.currency')}</span>
                    </div>
                    
                    {/* ЛОГІКА ЗБЕРЕЖЕНА: !hasAccess показує кнопку Купити, інакше Читати */}
                    {!hasAccess ? (
                        <button style={styles.buyButton} onClick={handleBuy}>{t('book.buy_btn')}</button>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            <button style={styles.readButton} onClick={handleRead}>{t('book.read_btn')}</button>
                            {isFileBook && (
                                <button style={styles.downloadButton} onClick={handleDownload}>{t('book.download_btn')}</button>
                            )}
                        </div>
                    )}
                    {hasAccess && isFileBook && (
                         <small style={{textAlign: 'center', color: '#666', fontSize: '12px'}}>
                             {t('book.format_file')}
                         </small>
                    )}
                </div>
            </div>

            <div style={styles.content}>
                <h1 style={styles.title}>{book.title}</h1>
                <div style={styles.tabs}>
                    <button style={activeTab === 'about' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('about')}>{t('book.about_tab')}</button>
                    {!isFileBook && (
                        <button style={activeTab === 'chapters' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('chapters')}>
                            {t('book.chapters_tab')} <span style={styles.badge}>{chapters.length}</span>
                        </button>
                    )}
                    <button style={activeTab === 'comments' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('comments')}>
                        {t('book.comments_tab')} <span style={styles.badge}>{comments.length}</span>
                    </button>
                </div>

                {activeTab === 'about' && (
                    <div style={styles.tabContent}>
                        <div style={styles.descriptionBlock}><p>{book.description || t('book.description_missing')}</p></div>
                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}><span style={styles.label}>{t('book.author')}</span><span style={styles.infoValue}>{book.authorName}</span></div>
                            <div style={styles.infoItem}><span style={styles.label}>{t('book.genre')}</span><span style={styles.infoValue}>{book.categoryName}</span></div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>{t('book.type')}</span>
                                <span style={styles.infoValue}>
                                    {isFileBook ? t('book.type_file') : t('book.type_chapters')}
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
                                        <button style={styles.smallReadBtn} onClick={() => navigate(`/read/${chapter.id}`)}>{t('common.read')}</button>
                                    ) : (<span style={{fontSize: '0.8em', color: '#999'}}>{t('book.access_locked')}</span>)}
                                </div>
                            )) : <p style={{color: '#777'}}>{t('book.chapters_empty')}</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div style={styles.tabContent}>
                        <div style={styles.commentFormBlock}>
                            {isLoggedIn ? (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px'}}>
                                    <h4 style={{margin: '0 0 5px 0', color: '#2c3e50'}}>{t('book.leave_comment')}</h4>

                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <span style={{fontSize: '14px', color: '#666'}}>{t('book.your_rating')}</span>
                                        <div>{renderStars(newRating, true)}</div>
                                    </div>

                                    <textarea 
                                        style={styles.textArea} 
                                        rows="3" 
                                        placeholder={t('book.comment_placeholder')} 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button 
                                        style={styles.submitBtn} 
                                        onClick={handleAddComment} 
                                        disabled={submittingComment || !newComment.trim()}
                                    >
                                        {submittingComment ? t('book.sending') : t('book.publish_btn')}
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.loginPrompt}>
                                    <p>{t('auth.login_prompt')}</p>
                                    <button style={styles.loginBtn} onClick={() => navigate('/login')}>{t('auth.login_btn')}</button>
                                </div>
                            )}
                        </div>

                        {comments.length > 0 ? (
                            <div style={styles.commentList}>
                                {comments.map(comment => (
                                    <div key={comment.id} style={styles.commentItem}>
                                        <div style={styles.commentHeader}>
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <span style={styles.commentUser}>{comment.userName || t('book.user_default')}</span>
                                                <div>{renderStars(comment.rating || 0)}</div>
                                            </div>
                                            <span style={styles.commentDate}>
                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p style={styles.commentText}>{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{textAlign: 'center', padding: '20px', color: '#777'}}>
                                <p>{t('book.no_comments')}</p>
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
    commentItem: { padding: '20px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' },
    commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', fontSize: '14px' },
    commentUser: { fontWeight: 'bold', color: '#2c3e50', fontSize: '16px', display: 'block', marginBottom: '4px' },
    commentDate: { color: '#95a5a6', fontSize: '12px' },
    commentText: { margin: 0, color: '#444', lineHeight: '1.6', fontSize: '15px' },
    commentFormBlock: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' },
    textArea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
    submitBtn: { alignSelf: 'flex-start', padding: '12px 24px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
    loginPrompt: { padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
    loginBtn: { padding: '10px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '15px' }
};

export default BookPage;