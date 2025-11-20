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

        
        Task<(string Type, object Content)?> GetBookReadContentAsync(int bookId, int userId, bool isAdmin);
    }
}
