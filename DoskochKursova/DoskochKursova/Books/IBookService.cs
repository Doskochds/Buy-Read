using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using DoskochKursova.Models;

namespace DoskochKursova.Books
{
    public interface IBookService
    {
        Task<IEnumerable<BookListDto>> GetAllBooksAsync(string? searchTerm, int? categoryId);
        Task<BookDetailsDto?> GetBookByIdAsync(int id);
        Task<Book> CreateBookAsync(CreateBookDto dto);
        Task UpdateBookAsync(Book book);
        Task DeleteBookAsync(int id);
        bool BookExists(int id);
        Task UploadFileAsync(int id, IFormFile file);
        Task<(byte[] Content, string FileName)?> GetFileAsync(int id);
        Task<(string Type, object Content)?> GetBookReadContentAsync(int bookId, int userId, bool isAdmin, string? lang = "uk");
    }
}