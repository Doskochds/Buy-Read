import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  uk: {
    translation: {
      layout: {
        home: "Головна",
        catalog: "Каталог",
        my_books: "Мої книги",
        admin: "Адмін",
        login: "Вхід",
        logout: "Вихід",
        footer: "Курсова робота."
      },
      common: {
        loading: "Завантаження...",
        error: "Помилка",
        currency: "₴",
        read: "Читати"
      },
      book: {
        price_label: "Вартість:",
        buy_confirm: "Купити книгу",
        for: "за",
        buy_success: "Покупка успішна!",
        buy_error: "Помилка покупки:",
        buy_btn: "Купити зараз",
        download_btn: "⬇️ Завантажити файл",
        read_btn: "📖 Читати",
        format_file: "Формат: Цілий файл",
        about_tab: "Про твір",
        chapters_tab: "Зміст",
        comments_tab: "Коментарі",
        description_missing: "Опис відсутній...",
        author: "Автор:",
        genre: "Жанр:",
        type: "Тип:",
        type_file: "Цілий твір",
        type_chapters: "Розділений твір",
        chapters_empty: "Зміст поки порожній.",
        access_locked: "🔒",
        leave_comment: "Залишити відгук:",
        your_rating: "Ваша оцінка:",
        comment_placeholder: "Напишіть вашу думку про книгу...",
        publish_btn: "Опублікувати",
        sending: "Відправка...",
        no_comments: "Ще немає відгуків. Будьте першим!",
        download_error: "Помилка при скачуванні файлу",
        comment_error: "Не вдалося додати коментар. Перевірте авторизацію.",
        user_default: "Користувач"
      },
      auth: {
        login_prompt: "Увійдіть в акаунт, щоб залишати коментарі",
        login_btn: "Увійти",
        title: "Вхід",
        label_login: "Логін",
        label_password: "Пароль",
        submit_btn: "Увійти",
        submitting: "Вхід...",
        no_account: "Немає акаунту?",
        register_link: "Зареєструватися",
        forgot_pass: "Забули пароль?",
        error_server: "Сервер не відповідає.",
        error_invalid: "Неправильний логін або пароль"
      },
      library: {
        title: "Моя бібліотека",
        loading: "Завантаження бібліотеки...",
        empty_text: "Ви ще нічого не купили.",
        catalog_btn: "Перейти до каталогу",
        read_btn: "Читати",
        error_loading: "Помилка завантаження бібліотеки:"
      },
      catalog: {
        title: "Каталог книг",
        search_placeholder: "Введіть назву або автора...",
        all_genres: "Всі жанри",
        search_btn: "Знайти",
        details_btn: "Детальніше",
        nothing_found_title: "😕 Нічого не знайдено",
        nothing_found_text: "Спробуйте змінити параметри пошуку."
      },
      createBook: {
        title: "Назва книги",
        description: "Опис",
        price: "Ціна (грн)",
        authorId: "ID Автора",
        category: "Категорія",
        choose_category: "Оберіть жанр",
        coverImage: "📸 Обкладинка книги (Картинка)",
        bookFile: "📄 Файл книги (PDF, EPUB, TXT)",
        fileOptional: "Можна завантажити пізніше, якщо зараз немає",
        uploadButton: "Завантажити книгу",
        coverAlert: "Будь ласка, оберіть обкладинку!",
        successAlert: "Книгу успішно створено!",
        errorAlert: "Помилка створення. Перевірте дані."
      },
      readPage: {
        back: "Назад",
        finish: "Завершити читання",
        translating: "🤖 Переклад...",
        loadingContent: "⏳ Обробка книги...",
        errorLoading: "Не вдалося завантажити контент. Можливо, у вас немає доступу."
      }
    }
  },

  en: {
    translation: {
      layout: {
        home: "Home",
        catalog: "Catalog",
        my_books: "My Books",
        admin: "Admin",
        login: "Login",
        logout: "Logout",
        footer: "Course project."
      },
      common: {
        loading: "Loading...",
        error: "Error",
        currency: "UAH",
        read: "Read"
      },
      book: {
        price_label: "Price:",
        buy_confirm: "Buy book",
        for: "for",
        buy_success: "Purchase successful!",
        buy_error: "Purchase error:",
        buy_btn: "Buy now",
        download_btn: "⬇️ Download file",
        read_btn: "📖 Read",
        format_file: "Format: Full file",
        about_tab: "About",
        chapters_tab: "Contents",
        comments_tab: "Comments",
        description_missing: "No description...",
        author: "Author:",
        genre: "Genre:",
        type: "Type:",
        type_file: "Full file",
        type_chapters: "Chapters",
        chapters_empty: "No chapters yet.",
        access_locked: "🔒",
        leave_comment: "Leave a review:",
        your_rating: "Your rating:",
        comment_placeholder: "Write your opinion...",
        publish_btn: "Publish",
        sending: "Sending...",
        no_comments: "No reviews yet.",
        download_error: "Download error",
        comment_error: "Failed to add comment. Check authorization.",
        user_default: "User"
      },
      library: {
        title: "My Library",
        loading: "Loading library...",
        empty_text: "You haven't purchased anything yet.",
        catalog_btn: "Go to Catalog",
        read_btn: "Read",
        error_loading: "Error loading library:"
      },
      auth: {
        login_prompt: "Login to leave comments",
        login_btn: "Login",
        title: "Login",
        label_login: "Username",
        label_password: "Password",
        submit_btn: "Sign In",
        submitting: "Signing in...",
        no_account: "No account?",
        register_link: "Register",
        forgot_pass: "Forgot password?",
        error_server: "Server not responding.",
        error_invalid: "Invalid username or password"
      },
      catalog: {
        title: "Book Catalog",
        search_placeholder: "Enter title or author...",
        all_genres: "All genres",
        search_btn: "Search",
        details_btn: "Details",
        nothing_found_title: "😕 Nothing found",
        nothing_found_text: "Try changing search parameters."
      },
      createBook: {
        title: "Book title",
        description: "Description",
        price: "Price (UAH)",
        authorId: "Author ID",
        category: "Category",
        choose_category: "Choose genre",
        coverImage: "📸 Book cover (Image)",
        bookFile: "📄 Book file (PDF, EPUB, TXT)",
        fileOptional: "Can upload later if not available now",
        uploadButton: "Upload book",
        coverAlert: "Please select a cover image!",
        successAlert: "Book created successfully!",
        errorAlert: "Creation error. Check data."
      },
      readPage: {
        back: "Back",
        finish: "Finish reading",
        translating: "🤖 Translating...",
        loadingContent: "⏳ Loading book...",
        errorLoading: "Failed to load content. You might not have access."
      }
    }
  },

  es: {
    translation: {
      layout: {
        home: "Inicio",
        catalog: "Catálogo",
        my_books: "Mis libros",
        admin: "Administrador",
        login: "Entrar",
        logout: "Salir",
        footer: "Trabajo de curso."
      },
      common: {
        loading: "Cargando...",
        error: "Error",
        currency: "UAH",
        read: "Leer"
      },
      book: {
        price_label: "Precio:",
        buy_confirm: "Comprar libro",
        for: "por",
        buy_success: "¡Compra exitosa!",
        buy_error: "Error de compra:",
        buy_btn: "Comprar ahora",
        download_btn: "⬇️ Descargar archivo",
        read_btn: "📖 Leer",
        format_file: "Formato: Archivo completo",
        about_tab: "Sobre la obra",
        chapters_tab: "Contenido",
        comments_tab: "Comentarios",
        description_missing: "Sin descripción...",
        author: "Autor:",
        genre: "Género:",
        type: "Tipo:",
        type_file: "Archivo completo",
        type_chapters: "Capítulos",
        chapters_empty: "Contenido vacío.",
        access_locked: "🔒",
        leave_comment: "Deja tu opinión:",
        your_rating: "Tu calificación:",
        comment_placeholder: "Escribe tu opinión...",
        publish_btn: "Publicar",
        sending: "Enviando...",
        no_comments: "Aún no hay comentarios.",
        download_error: "Error de descarga",
        comment_error: "No se pudo agregar el comentario. Verifica tu autorización.",
        user_default: "Usuario"
      },
      auth: {
        login_prompt: "Inicia sesión para comentar",
        login_btn: "Entrar",
        title: "Iniciar sesión",
        label_login: "Usuario",
        label_password: "Contraseña",
        submit_btn: "Entrar",
        submitting: "Entrando...",
        no_account: "¿No tienes cuenta?",
        register_link: "Registrarse",
        forgot_pass: "¿Olvidaste tu contraseña?",
        error_server: "El servidor no responde.",
        error_invalid: "Usuario o contraseña incorrectos"
      },
      catalog: {
        title: "Catálogo de libros",
        search_placeholder: "Ingrese título o autor...",
        all_genres: "Todos los géneros",
        search_btn: "Buscar",
        details_btn: "Detalles",
        nothing_found_title: "😕 Nada encontrado",
        nothing_found_text: "Intente cambiar los parámetros de búsqueda."
      },
      createBook: {
        title: "Título del libro",
        description: "Descripción",
        price: "Precio (UAH)",
        authorId: "ID del autor",
        category: "Categoría",
        choose_category: "Elige un género",
        coverImage: "📸 Portada del libro (Imagen)",
        bookFile: "📄 Archivo del libro (PDF, EPUB, TXT)",
        fileOptional: "Se puede subir más tarde si no está disponible ahora",
        uploadButton: "Subir libro",
        coverAlert: "¡Por favor, selecciona una portada!",
        successAlert: "¡Libro creado con éxito!",
        errorAlert: "Error de creación. Revisa los datos."
      },
      readPage: {
        back: "Atrás",
        finish: "Terminar lectura",
        translating: "🤖 Traduciendo...",
        loadingContent: "⏳ Cargando libro...",
        errorLoading: "No se pudo cargar el contenido. Puede que no tengas acceso."
      },
      library: {
        title: "Mi Biblioteca",
        loading: "Cargando biblioteca...",
        empty_text: "Aún no has comprado nada.",
        catalog_btn: "Ir al Catálogo",
        read_btn: "Leer",
        error_loading: "Error al cargar la biblioteca:"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "uk", 
    fallbackLng: "uk",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;