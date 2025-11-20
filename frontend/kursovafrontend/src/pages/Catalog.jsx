import { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { Link } from 'react-router-dom';

const Catalog = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.get('/Categories')
            .then(response => setCategories(response.data))
            .catch(error => console.error("Не вдалося завантажити категорії:", error));
        
        loadBooks(); 
    }, []);

    const loadBooks = (filters = {}) => {
        setIsLoading(true);
        api.get('/Books', { params: filters }) 
            .then(response => {
                setBooks(response.data);
            })
            .catch(error => console.error("Помилка при завантаженні книг:", error))
            .finally(() => setIsLoading(false));
    };

    const handleSearch = () => {
        const params = {};
        if (searchTerm.trim()) params.searchTerm = searchTerm;
        if (selectedCategory) params.categoryId = selectedCategory;
        loadBooks(params);
    };

    return (
        <div>
            <h1>Каталог книг</h1>
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
                    placeholder="Введіть назву або автора..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                />

                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '10px', minWidth: '150px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="">Всі жанри</option>
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
                    Знайти
                </button>
            </div>

            {isLoading ? (
                <p style={{textAlign: 'center', fontSize: '1.2em'}}>Завантаження...</p>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '25px' 
                }}>
                    {books.map(book => (
                        <div key={book.id} style={{ 
                            border: '1px solid #eee', 
                            borderRadius: '10px', 
                            padding: '20px', 
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            backgroundColor: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{book.title}</h3>
                                <p style={{ margin: '0 0 5px 0', color: '#666' }}>✍️ {book.authorName}</p>
                                
                                {/* Відображаємо категорію, якщо вона є */}
                                {book.categoryName && (
                                    <span style={{ 
                                        display: 'inline-block', 
                                        backgroundColor: '#e9ecef', 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.85em',
                                        color: '#495057'
                                    }}>
                                        🏷️ {book.categoryName}
                                    </span>
                                )}
                                
                                <p style={{ fontSize: '0.9em', color: '#777', marginTop: '15px' }}>
                                    {book.description ? (
                                        book.description.length > 100 
                                            ? book.description.substring(0, 100) + "..." 
                                            : book.description
                                    ) : "Опис відсутній"}
                                </p>
                            </div>
                            
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#28a745' }}>
                                    {book.price} ₴
                                </span>
                                <Link to={`/book/${book.id}`}>
                                <button style={{ 
                                    padding: '8px 20px', 
                                    border: '1px solid #007bff', 
                                    backgroundColor: 'white', 
                                    color: '#007bff', 
                                    borderRadius: '5px', 
                                    cursor: 'pointer' 
                                }}>
                                    Детальніше
                                </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && books.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>
                    <h2>😕 Нічого не знайдено</h2>
                    <p>Спробуйте змінити параметри пошуку.</p>
                </div>
            )}
        </div>
    );
};

export default Catalog;