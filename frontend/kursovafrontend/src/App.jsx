import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Register from './pages/Register'; 
import Login from './pages/Login';
import BookPage from './pages/BookPage';
import ReadPage from './pages/ReadPage';
import MyLibrary from './pages/MyLibrary';
import CreateBook from './pages/Adminonly/CreateBook';
import ConfirmEmail from './pages/ConfirmEmail';


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
          <Route path="library" element={<MyLibrary />} />
          <Route path="admin/create" element={<CreateBook />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
        </Route>
        <Route path="/read/:chapterId" element={<ReadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;