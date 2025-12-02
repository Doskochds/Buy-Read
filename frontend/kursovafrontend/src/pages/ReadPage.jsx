import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DOMPurify from 'dompurify';

const ReadPage = () => {
    // Нам більше не потрібен `mode` чи `chapterId` з props.
    // Ми беремо `chapterId` з URL, бо ми переходимо на /read/:chapterId
    const { chapterId } = useParams();
    const navigate = useNavigate();
    
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [bookId, setBookId] = useState(null);
    
    // Нові стани для файлів
    const [bookType, setBookType] = useState(""); // 'Episodic', 'Simple', 'File'
    const [fileData, setFileData] = useState(null);

    const [isTranslating, setIsTranslating] = useState(false);
    const [currentLang, setCurrentLang] = useState("uk");

    useEffect(() => {
        if (chapterId) {
            loadOriginal();
        }
    }, [chapterId]);

    const loadOriginal = () => {
        setIsTranslating(true);
        
        // 1. Пробуємо завантажити як Главу (найчастіший випадок)
        api.get(`/Chapters/${chapterId}`)
            .then(res => {
                // Це успіх: ми отримали текст глави
                setBookType('Episodic'); // Або 'Simple', для читалки різниці немає
                setContent(res.data.content);
                setTitle(res.data.title);
                setBookId(res.data.bookId);
                setCurrentLang("uk");
            })
            .catch(err => {
                // Якщо помилка (наприклад, це не глава, а ціла книга-файл, і ми прийшли з іншим ID?)
                // Але в нашій новій архітектурі ми завжди переходимо по ID глави.
                // Хіба що ми хочемо підтримати старі посилання.
                
                // Якщо 404, спробуємо "запасний варіант" - отримати інфо через Book/read
                // (але в новій логіці BookPage ми вже знаємо ID глави, тому це малоймовірно)
                console.error(err);
                alert("Помилка завантаження тексту.");
                navigate(-1);
            })
            .finally(() => setIsTranslating(false));
    };

    const handleTranslate = async (lang) => {
        if (bookType === 'File') return; // Файли не перекладаємо

        if (lang === "uk") {
            loadOriginal();
            return;
        }
        setIsTranslating(true);
        try {
            const res = await api.get(`/Chapters/${chapterId}/translate?lang=${lang}`);
            setContent(res.data.translatedContent);
            setCurrentLang(lang);
        } catch (err) {
            alert("Помилка перекладу");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleClose = () => {
        if (bookId) navigate(`/book/${bookId}`);
        else navigate('/'); 
    };

    return (
        <div style={styles.readerContainer}>
            {/* Панель (toolbar) */}
            <div style={styles.toolbar}>
                <button onClick={handleClose} style={styles.closeBtn}>← До книги</button>
                
                {/* Перемикач мов (тільки для тексту) */}
                {bookType !== 'File' && (
                    <div style={styles.langSwitcher}>
                        <button style={currentLang === 'uk' ? styles.langBtnActive : styles.langBtn} onClick={() => handleTranslate('uk')} disabled={isTranslating}>🇺🇦</button>
                        <button style={currentLang === 'en' ? styles.langBtnActive : styles.langBtn} onClick={() => handleTranslate('en')} disabled={isTranslating}>🇬🇧</button>
                        <button style={currentLang === 'pl' ? styles.langBtnActive : styles.langBtn} onClick={() => handleTranslate('pl')} disabled={isTranslating}>🇵🇱</button>
                    </div>
                )}
            </div>

            <h1 style={styles.chapterTitle}>{title}</h1>

            {isTranslating ? (
                <div style={styles.skeletonWrapper}>
                    <p style={{textAlign: 'center', color: '#888'}}>🤖 Переклад...</p>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} style={{
                            height: '18px', 
                            backgroundColor: '#f0f0f0', 
                            marginBottom: '15px', 
                            borderRadius: '4px',
                            width: Math.random() * (100 - 80) + 80 + '%',
                            animation: 'pulse 1.5s infinite ease-in-out'
                        }}></div>
                    ))}
                    <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
                </div>
            ) : (
                // --- ЛОГІКА ВІДОБРАЖЕННЯ (PDF vs ТЕКСТ) ---
                // Ми перевіряємо, чи ми отримали HTML-текст, чи це PDF
                // Оскільки ChaptersController повертає текст, тут все просто.
                // Але якщо ви колись додасте PDF-глави, тут буде перевірка.
                
                // В нашій поточній реалізації ("Уніфікація"), навіть PDF, завантажений через Upload,
                // зберігається як бінарний файл, а для тексту створюється Глава.
                // Тому тут ми завжди показуємо текст.
                
                // Єдиний виняток: Якщо ми хочемо показати PDF, який НЕ був конвертований у главу.
                // Але з BookPage ми переходимо тільки на глави.
                
                <div 
                    style={styles.content}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
                />
            )}
            
            <div style={{marginTop: '50px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px', paddingBottom: '40px'}}>
                 <button onClick={handleClose} style={styles.bigCloseBtn}>Завершити читання</button>
            </div>
        </div>
    );
};

const styles = {
    readerContainer: { maxWidth: '800px', margin: '0 auto', padding: '0 20px', backgroundColor: '#fff', minHeight: '100vh' },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'sticky', top: '0', backgroundColor: 'rgba(255,255,255,0.98)', padding: '15px 0', borderBottom: '1px solid #eee', zIndex: 100 },
    closeBtn: { padding: '8px 15px', border: '1px solid #ccc', backgroundColor: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', color: '#555' },
    langSwitcher: { display: 'flex', gap: '8px' },
    langBtn: { padding: '6px 10px', cursor: 'pointer', border: '1px solid transparent', backgroundColor: '#f5f5f5', borderRadius: '6px', fontSize: '14px' },
    langBtnActive: { padding: '6px 10px', cursor: 'pointer', border: '1px solid #007bff', backgroundColor: '#e7f1ff', borderRadius: '6px', color: '#007bff', fontWeight: 'bold', fontSize: '14px' },
    chapterTitle: { textAlign: 'center', fontSize: '36px', marginBottom: '40px', marginTop: '20px', fontFamily: "'Merriweather', serif", color: '#222' },
    content: { fontSize: '20px', lineHeight: '1.8', color: '#333', fontFamily: "'Merriweather', 'Georgia', serif", textAlign: 'justify' },
    skeletonWrapper: { padding: '20px 0' },
    bigCloseBtn: { padding: '12px 30px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '30px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
};

export default ReadPage;