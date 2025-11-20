import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    // Стан для полів форми
    const [formData, setFormData] = useState({
        login: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Оновлення полів при вводі
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Відправка форми
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // 1. Базова перевірка на клієнті
        if (formData.password !== formData.confirmPassword) {
            setError('Паролі не співпадають!');
            setIsLoading(false);
            return;
        }

        try {
            // 2. Відправка запиту на бекенд
            // Ми відправляємо тільки те, що чекає RegisterDto (login, email, password)
            const response = await api.post('/Account/register', {
                login: formData.login,
                email: formData.email,
                password: formData.password
            });

            // 3. Якщо успіх (200 OK)
            setSuccess(true);
            
        } catch (err) {
            // 4. Обробка помилок
            if (err.response && err.response.data) {
                // Якщо сервер повернув конкретну помилку (напр. "Логін зайнятий")
                // Часто Identity повертає масив помилок, або просто об'єкт message
                const errorData = err.response.data;
                
                if (Array.isArray(errorData)) {
                     // Якщо це список помилок Identity (напр. пароль без цифр)
                    setError(errorData.map(e => e.description).join(', '));
                } else if (errorData.message) {
                    setError(errorData.message);
                } else {
                    setError("Помилка реєстрації. Перевірте дані.");
                }
            } else {
                setError("Сервер не відповідає. Спробуйте пізніше.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Якщо реєстрація успішна, показуємо інший екран
    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={{color: '#28a745'}}>🎉 Успіх!</h2>
                    <p>Ваш акаунт створено.</p>
                    <p>Ми надіслали лист на <b>{formData.email}</b>.</p>
                    <p>Будь ласка, підтвердіть пошту, щоб увійти.</p>
                    <Link to="/login" style={styles.link}>Перейти до входу</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Реєстрація</h2>
                
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
                        <label>Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
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
                            placeholder="Мін. 8 символів, цифра, Велика літера"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label>Підтвердіть пароль</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            required 
                            style={styles.input}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        style={styles.button}
                    >
                        {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
                    </button>
                </form>

                <p style={{marginTop: '15px', textAlign: 'center'}}>
                    Вже є акаунт? <Link to="/login" style={styles.link}>Увійти</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start', // Не центруємо по вертикалі, а просто відступаємо зверху
        paddingTop: '50px',       // Відступ від шапки
        paddingBottom: '50px'     // Відступ знизу
    },
    card: { 
        width: '100%', 
        maxWidth: '400px',        // Адаптивність: не ширше 400px
        padding: '20px', 
        // Ми прибрали boxShadow, border і backgroundColor
    },
    form: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px'               // Більше повітря між полями
    },
    inputGroup: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
    },
    input: { 
        padding: '12px', 
        borderRadius: '8px',      // Більш округлі кути
        border: '1px solid #e0e0e0', 
        fontSize: '16px',
        backgroundColor: '#f9f9f9' // Легкий фон для полів
    },
    button: { 
        padding: '14px', 
        backgroundColor: '#007bff', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontSize: '16px', 
        fontWeight: 'bold',
        marginTop: '10px'
    },
    error: { 
        backgroundColor: '#ffebee', 
        color: '#c62828', 
        padding: '10px', 
        borderRadius: '8px', 
        marginBottom: '20px', 
        textAlign: 'center' 
    },
    link: { 
        color: '#007bff', 
        textDecoration: 'none', 
        fontWeight: '600' 
    }
};

export default Register;