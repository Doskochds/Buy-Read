import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CreateBook = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        authorId: '',
        categoryId: ''
    });

    const [coverImage, setCoverImage] = useState(null);
    const [bookFile, setBookFile] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.get('/Categories')
           .then(res => setCategories(res.data))
           .catch(err => console.log(err));
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleCoverChange = (e) => setCoverImage(e.target.files[0]);
    const handleFileChange = (e) => setBookFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!coverImage) { 
            alert(t('createBook.coverAlert')); 
            return; 
        }

        const data = new FormData();
        data.append('Title', formData.title);
        data.append('Description', formData.description);
        data.append('Price', formData.price);
        data.append('AuthorId', formData.authorId);
        if (formData.categoryId) data.append('CategoryId', formData.categoryId);
        data.append('CoverImage', coverImage);
        if (bookFile) data.append('BookFile', bookFile);

        try {
            await api.post('/Books', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert(t('createBook.successAlert'));
            navigate('/catalog');
        } catch (error) {
            const errorMsg = error.response?.data?.title || t('createBook.errorAlert');
            alert(errorMsg);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{t('createBook.title')}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={styles.label}>{t('createBook.title')}</label>
                    <input name="title" value={formData.title} onChange={handleChange} required style={styles.input} />
                </div>

                <div>
                    <label style={styles.label}>{t('createBook.description')}</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...styles.input, minHeight: '80px' }} />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>{t('createBook.price')}</label>
                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required style={styles.input} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>{t('createBook.authorId')}</label>
                        <input name="authorId" type="number" value={formData.authorId} onChange={handleChange} required style={styles.input} />
                    </div>
                </div>

                <div>
                    <label style={styles.label}>{t('createBook.category')}</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={styles.input}>
                        <option value="">{t('createBook.choose_category')}</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
                    <label style={styles.label}>{t('createBook.coverImage')}</label>
                    <input type="file" accept="image/*" onChange={handleCoverChange} required style={styles.fileInput} />
                    {coverImage && <small style={{ color: 'green' }}>{t('createBook.selected')}: {coverImage.name}</small>}
                </div>

                <div>
                    <label style={styles.label}>{t('createBook.bookFile')}</label>
                    <input type="file" accept=".pdf,.epub,.txt,.fb2" onChange={handleFileChange} style={styles.fileInput} />
                    <small style={{ color: '#888', display: 'block' }}>{t('createBook.fileOptional')}</small>
                </div>

                <button type="submit" style={styles.button}>{t('createBook.uploadButton')}</button>
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
