import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Register from './pages/Register'; 
import Login from './pages/Login';
import BookPage from './pages/BookPage';
import ReadPage from './pages/ReadPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="book/:id" element={<BookPage />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="/read/:chapterId" element={<ReadPage />} />
        <Route path="/read-book/:bookId" element={<ReadPage mode="book" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;