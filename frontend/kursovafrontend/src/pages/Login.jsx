import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const navigate = useNavigate(); // Хук для перенаправлення користувача
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Відправляємо запит
            const response = await api.post('/Account/login', formData);

            // 2. Отримуємо токен з відповіді
            const { token, message } = response.data;

            // 3. Зберігаємо токен у "кишеню" браузера (LocalStorage)
            localStorage.setItem('jwt-token', token);
            
            // (Опціонально) Зберігаємо ім'я користувача, щоб показати в шапці
            localStorage.setItem('username', formData.login);

            alert(message); // "Вхід успішний"

            // 4. Перекидаємо на каталог
            navigate('/catalog'); 
            
            // Перезавантажуємо сторінку, щоб Axios підхопив токен (це простий варіант)
            window.location.reload(); 

        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Неправильний логін або пароль");
            } else {
                setError("Сервер не відповідає.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Вхід</h2>
                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label>Логін</label>
                        <input 
                            type="text" 
                            name="login" 
                            value={formData.login} 
                            onChange={handleChange} 
                            required 
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label>Пароль</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} style={styles.button}>
                        {isLoading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>

                <p style={{marginTop: '15px', textAlign: 'center'}}>
                    Немає акаунту? <Link to="/register" style={styles.link}>Зареєструватися</Link>
                </p>
                <p style={{marginTop: '5px', textAlign: 'center', fontSize: '0.9em'}}>
                   <a href="#" style={{color: '#666'}}>Забули пароль?</a>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' },
    card: { width: '350px', padding: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: 'white' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' },
    button: { padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    error: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '10px', textAlign: 'center' },
    link: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }
};

export default Login;