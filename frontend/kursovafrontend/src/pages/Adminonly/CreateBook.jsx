import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const CreateBook = () => {
    const navigate = useNavigate();
    
    // Стейт для текстових полів
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        authorId: '',
        categoryId: ''
    });

    // Стейт для файлів (окремо, бо це об'єкти File, а не стрічки)
    const [coverImage, setCoverImage] = useState(null);
    const [bookFile, setBookFile] = useState(null);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Отримуємо категорії для випадаючого списку
        api.get('/Books').then(() => { 
             // Тут я залишив твій запит на категорії, але зверни увагу:
             // Якщо в тебе контролер категорій, то має бути api.get('/Categories')
             // Якщо ти брав з книг, то треба змінити логіку. 
             // Припустимо, що ендпоінт категорій існує:
             // api.get('/Categories').then(res => setCategories(res.data));
             
             // Для тесту поки заглушка, якщо бекенд категорій ще не готовий:
             setCategories([
                 { id: 1, name: "Фантастика" }, 
                 { id: 2, name: "Детектив" }
             ]); 
        });
        
        // Реальниий запит розкоментуй, коли буде контролер категорій:
        api.get('/Categories').then(res => setCategories(res.data)).catch(err => console.log(err));

    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Окремі хендлери для файлів
    const handleCoverChange = (e) => {
        setCoverImage(e.target.files[0]);
    };

    const handleFileChange = (e) => {
        setBookFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Створюємо об'єкт FormData (це "конверт" для файлів)
        const data = new FormData();
        
        // 2. Додаємо текстові поля. 
        // ВАЖЛИВО: Назви ключів ('Title', 'Description'...) мають збігатися з DTO на C#!
        data.append('Title', formData.title);
        data.append('Description', formData.description);
        data.append('Price', formData.price);
        data.append('AuthorId', formData.authorId);
        
        if (formData.categoryId) {
            data.append('CategoryId', formData.categoryId);
        }

        // 3. Додаємо файли, якщо вони обрані
        if (coverImage) {
            data.append('CoverImage', coverImage);
        } else {
             alert("Будь ласка, оберіть обкладинку!");
             return;
        }

        if (bookFile) {
            data.append('BookFile', bookFile);
        }

        try {
            // 4. Відправляємо з заголовком multipart/form-data
            await api.post('/Books', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            alert("Книгу успішно створено!");
            navigate('/catalog'); // Або куди ти хочеш перенаправити
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.title || "Помилка створення. Перевірте дані.";
            alert(errorMsg);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Додати нову книгу</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Текстові поля залишаються такими ж */}
                <div>
                    <label style={styles.label}>Назва книги</label>
                    <input name="title" value={formData.title} onChange={handleChange} required style={styles.input} />
                </div>

                <div>
                    <label style={styles.label}>Опис</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} style={{...styles.input, minHeight: '80px'}} />
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                    <div style={{flex: 1}}>
                        <label style={styles.label}>Ціна (грн)</label>
                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required style={styles.input} />
                    </div>
                    <div style={{flex: 1}}>
                         <label style={styles.label}>ID Автора</label>
                         <input name="authorId" type="number" value={formData.authorId} onChange={handleChange} required style={styles.input} />
                    </div>
                </div>

                <div>
                    <label style={styles.label}>Категорія</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={styles.input}>
                        <option value="">Оберіть жанр</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* --- НОВІ ПОЛЯ ДЛЯ ФАЙЛІВ --- */}
                
                <div style={{borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px'}}>
                    <label style={styles.label}>📸 Обкладинка книги (Картинка)</label>
                    <input 
                        type="file" 
                        accept="image/*" // Приймаємо тільки зображення
                        onChange={handleCoverChange} 
                        required 
                        style={styles.fileInput} 
                    />
                    {coverImage && <small style={{color: 'green'}}>Обрано: {coverImage.name}</small>}
                </div>

                <div>
                    <label style={styles.label}>📄 Файл книги (PDF, EPUB, TXT)</label>
                    <input 
                        type="file" 
                        accept=".pdf,.epub,.txt,.fb2" // Обмеження форматів
                        onChange={handleFileChange} 
                        style={styles.fileInput} 
                    />
                    <small style={{color: '#888', display: 'block'}}>Можна завантажити пізніше, якщо зараз немає</small>
                </div>

                <button type="submit" style={styles.button}>Завантажити книгу</button>
            </form>
        </div>
    );
};

const styles = {
    label: { fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#333' },
    input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
    fileInput: { display: 'block', marginTop: '5px', padding: '5px' },
    button: { marginTop: '20px', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }
};

export default CreateBook;