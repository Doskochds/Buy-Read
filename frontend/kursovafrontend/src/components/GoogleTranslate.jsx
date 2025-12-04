import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "uk", 
          includedLanguages: "uk,en,es", 
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const changeLanguage = (langCode) => {
    const cookieValue = `/uk/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`; 
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <button onClick={() => changeLanguage('uk')} style={styles.btn}>🇺🇦 UA</button>
      <button onClick={() => changeLanguage('en')} style={styles.btn}>🇬🇧 EN</button>
      <button onClick={() => changeLanguage('es')} style={styles.btn}>🇪🇸 ES</button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '10px',
    marginLeft: '20px'
  },
  btn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

export default GoogleTranslate;