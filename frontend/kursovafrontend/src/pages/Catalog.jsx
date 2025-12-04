import { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

const API_BASE_URL = "https://localhost:7025"; 

const Catalog = () => {
    const { t } = useTranslation(); 
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.get('/Categories')
            .then(response => setCategories(response.data))
            .catch(error => console.error("Error loading categories:", error));
        
        loadBooks(); 
    }, []);

    const loadBooks = (filters = {}) => {
        setIsLoading(true);
        api.get('/Books', { params: filters }) 
            .then(response => {
                setBooks(response.data);
            })
            .catch(error => console.error("Error loading books:", error))
            .finally(() => setIsLoading(false));
    };

    const handleSearch = () => {
        const params = {};
        if (searchTerm.trim()) params.searchTerm = searchTerm;
        if (selectedCategory) params.categoryId = selectedCategory;
        loadBooks(params);
    };

    const getCoverUrl = (path) => {
        if (!path) return "https://placehold.co/300x450/ffffff/000000?text=:(+No+Cover"; 
        return `${API_BASE_URL}${path}`;
    };

    return (
        <div>
            {/* Заголовок */}
            <h1>{t('catalog.title')}</h1>
            
            <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '30px',
                display: 'flex', 
                gap: '15px', 
                alignItems: 'center', 
                flexWrap: 'wrap' 
            }}>
                <input 
                    type="text" 
                    placeholder={t('catalog.search_placeholder')} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                />

                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '10px', minWidth: '150px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="">{t('catalog.all_genres')}</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <button 
                    onClick={handleSearch} 
                    style={{ 
                        padding: '10px 25px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold' 
                    }}
                >
                    {t('catalog.search_btn')}
                </button>
            </div>

            {isLoading ? (
                <p style={{textAlign: 'center', fontSize: '1.2em'}}>{t('common.loading')}</p>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                    gap: '25px' 
                }}>
                    {books.map(book => (
                        <div key={book.id} style={{ 
                            border: '1px solid #eee', 
                            borderRadius: '10px', 
                            overflow: 'hidden', 
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            backgroundColor: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {/* --- БЛОК З КАРТИНКОЮ --- */}
                            <div style={{ 
                                width: '100%', 
                                height: '320px', 
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <img 
                                    src={getCoverUrl(book.coverImagePath)} 
                                    alt={book.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover' 
                                    }}
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x450/ffffff/000000?text=:(+Error"; }} 
                                />
                            </div>
                            {/* ----------------------- */}

                            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.1em' }}>{book.title}</h3>
                                    <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9em' }}>✍️ {book.authorName}</p>
                                    
                                    {book.categoryName && (
                                        <span style={{ 
                                            display: 'inline-block', 
                                            backgroundColor: '#e9ecef', 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.8em',
                                            color: '#495057',
                                            marginTop: '5px'
                                        }}>
                                            {book.categoryName}
                                        </span>
                                    )}
                                </div>
                                
                                <div style={{ marginTop: 'auto', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#28a745' }}>
                                        {book.price} {t('common.currency')}
                                    </span>
                                    <Link to={`/book/${book.id}`}>
                                        <button style={{ 
                                            padding: '8px 20px', 
                                            border: '1px solid #007bff', 
                                            backgroundColor: '#fff', 
                                            color: '#007bff', 
                                            borderRadius: '5px', 
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => { e.target.style.backgroundColor = '#007bff'; e.target.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#007bff'; }}
                                        >
                                            {t('catalog.details_btn')}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && books.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>
                    <h2>{t('catalog.nothing_found_title')}</h2>
                    <p>{t('catalog.nothing_found_text')}</p>
                </div>
            )}
        </div>
    );
};

export default Catalog;