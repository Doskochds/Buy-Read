import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import DOMPurify from 'dompurify';

const ReadPage = () => {
    const { chapterId } = useParams(); 
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const readType = searchParams.get('type');

    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    
    const [contentType, setContentType] = useState("html"); 
    
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);
    const [currentLang, setCurrentLang] = useState("uk");

    useEffect(() => {
        if (!chapterId) return;
        return () => {
            if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl, chapterId]);

    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            try {
                if (readType === 'file') {
                    const response = await api.get(`/Books/${chapterId}/read`);
                    const { bookType, data } = response.data;

                    if (bookType === 'RawText') {
                        setTitle("Читання книги");
                        setContent(data); 
                        setContentType("text");
                    } 
                    else {
                        const fileResponse = await api.get(`/Books/${chapterId}/download`, {
                            responseType: 'blob'
                        });
                        const file = new Blob([fileResponse.data], { type: 'application/pdf' });
                        const fileURL = URL.createObjectURL(file);
                        
                        setPdfUrl(fileURL);
                        setContentType("pdf");
                        setTitle("Перегляд файлу");
                    }
                } 
                else {
                    await loadTextChapter();
                    setContentType("html");
                }
            } catch (error) {
                console.error("Помилка:", error);
                alert("Не вдалося завантажити контент. Можливо, у вас немає доступу.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [chapterId, readType, navigate]);

    const loadTextChapter = async () => {
        const res = await api.get(`/Chapters/${chapterId}`);
        setContent(res.data.content);
        setTitle(res.data.title);
        setCurrentLang("uk");
    };

    const handleTranslate = async (lang) => {
        if (contentType === 'pdf') return; 

        setLoading(true);
        setIsTranslating(true);

        try {
            if (lang === "uk") {
                if (readType === 'file') {
                     const response = await api.get(`/Books/${chapterId}/read`);
                     setContent(response.data.data);
                } else {
                     await loadTextChapter();
                }
            } else {
                if (readType === 'file') {
                    const response = await api.get(`/Books/${chapterId}/read?lang=${lang}`);
                    setContent(response.data.data);
                } else {
                    const res = await api.get(`/Chapters/${chapterId}/translate?lang=${lang}`);
                    setContent(res.data.translatedContent);
                }
            }
            setCurrentLang(lang);
        } catch (err) {
            console.error("Помилка перекладу:", err);
            alert("Помилка при перекладі.");
        } finally {
            setLoading(false);
            setIsTranslating(false);
        }
    };

    return (
        <div style={styles.readerContainer}>
            <div style={styles.toolbar}>
                <button onClick={() => navigate(-1)} style={styles.closeBtn}>← Назад</button>
                
                {contentType !== 'pdf' && (
                    <div style={styles.langSwitcher}>
                        <button style={currentLang === 'uk' ? styles.langBtnActive : styles.langBtn} onClick={() => handleTranslate('uk')} disabled={isTranslating}>🇺🇦</button>
                        <button style={currentLang === 'en' ? styles.langBtnActive : styles.langBtn} onClick={() => handleTranslate('en')} disabled={isTranslating}>🇬🇧</button>
                        <button style={currentLang === 'pl' ? styles.langBtnActive : styles.langBtn} onClick={() => handleTranslate('pl')} disabled={isTranslating}>🇵🇱</button>
                    </div>
                )}
            </div>

            {loading ? (
                 <div style={{textAlign: 'center', marginTop: '50px', fontSize: '1.2em'}}>⏳ Обробка книги...</div>
            ) : (
                <>
                    <h1 style={styles.chapterTitle}>{title}</h1>

                    {contentType === 'pdf' ? (
                        <div style={{height: '85vh', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden'}}>
                            {pdfUrl && <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />}
                        </div>
                    ) : (
                        isTranslating ? (
                            <div style={styles.skeletonWrapper}><p style={{textAlign: 'center', color: '#888'}}>🤖 Переклад...</p></div>
                        ) : (
                            <div 
                                style={styles.htmlContent}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
                            />
                        )
                    )}
                </>
            )}

            <div style={{marginTop: '50px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px', paddingBottom: '40px'}}>
                 <button onClick={() => navigate(-1)} style={styles.bigCloseBtn}>Завершити читання</button>
            </div>
        </div>
    );
};

const styles = {
    readerContainer: { maxWidth: '900px', margin: '0 auto', padding: '0 20px', backgroundColor: '#fff', minHeight: '100vh' },
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'sticky', top: '0', backgroundColor: 'rgba(255,255,255,0.98)', padding: '15px 0', borderBottom: '1px solid #eee', zIndex: 100 },
    closeBtn: { padding: '8px 15px', border: '1px solid #ccc', backgroundColor: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', color: '#555' },
    langSwitcher: { display: 'flex', gap: '8px' },
    langBtn: { padding: '6px 10px', cursor: 'pointer', border: '1px solid transparent', backgroundColor: '#f5f5f5', borderRadius: '6px', fontSize: '14px' },
    langBtnActive: { padding: '6px 10px', cursor: 'pointer', border: '1px solid #007bff', backgroundColor: '#e7f1ff', borderRadius: '6px', color: '#007bff', fontWeight: 'bold', fontSize: '14px' },
    chapterTitle: { textAlign: 'center', fontSize: '32px', marginBottom: '30px', marginTop: '10px', fontFamily: "'Merriweather', serif", color: '#222' },
    
    htmlContent: { 
        fontSize: '20px', 
        lineHeight: '1.8', 
        color: '#333', 
        fontFamily: "'Merriweather', 'Georgia', serif", 
        textAlign: 'justify',
        paddingBottom: '50px'
    },
    
    skeletonWrapper: { padding: '50px 0', textAlign: 'center' },
    bigCloseBtn: { padding: '12px 30px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '30px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
};

export default ReadPage;