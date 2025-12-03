import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('Перевірка даних...');

    useEffect(() => {
        const confirm = async () => {

            const userId = searchParams.get('userId');
            const token = searchParams.get('token');

            if (!userId || !token) {
                setStatus('error');
                setMessage('Невірне посилання для підтвердження.');
                return;
            }

            try {
                
                await axios.get('https://localhost:7025/api/account/confirmEmail', {
                    params: {
                        userId: userId,
                        token: token
                    }
                });

                setStatus('success');
                setMessage('Email успішно підтверджено! Зараз ви будете перенаправлені на сторінку входу.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);

            } catch (error) {
                console.error(error);
                setStatus('error');
                
                setMessage(error.response?.data?.Message || 'Сталася помилка при підтвердженні пошти. Спробуйте ще раз або зверніться до підтримки.');
            }
        };

        confirm();
    }, [searchParams, navigate]);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Підтвердження Email</h2>
                
                {status === 'loading' && <p>⏳ {message}</p>}
                
                {status === 'success' && (
                    <div style={{ color: 'green' }}>
                        <h3>✅ Успіх!</h3>
                        <p>{message}</p>
                        <button onClick={() => navigate('/login')} style={styles.button}>
                            Увійти зараз
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ color: 'red' }}>
                        <h3>❌ Помилка</h3>
                        <p>{message}</p>
                        <button onClick={() => navigate('/')} style={styles.button}>
                            На головну
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Прості стилі для прикладу
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
    },
    card: {
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
    },
    button: {
        marginTop: '1rem',
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
    }
};

export default ConfirmEmail;