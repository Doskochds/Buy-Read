using Microsoft.EntityFrameworkCore;
using DoskochKursova.Data;


namespace DoskochKursova.Books
{
    public class BookService : IBookService
    {
        private readonly StoreContext _context;

        public BookService(StoreContext context)
        {
            _context = context;
        }

       
        public async Task<IEnumerable<BookListDto>> GetAllBooksAsync(string? searchTerm, int? categoryId)
        {
            
            var query = _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {

                query = query.Where(b => b.Title.Contains(searchTerm) || b.Author.Name.Contains(searchTerm));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b => b.CategoryId == categoryId.Value);
            }

            return await query.Select(b => new BookListDto
            {
                Id = b.Id,
                Title = b.Title,
                AuthorName = b.Author.Name,
                CategoryName = b.Category != null ? b.Category.Name : "Без категорії",
                Price = b.Price,
                Description = b.Description
            }).ToListAsync();
        }

        public async Task<BookDetailsDto?> GetBookByIdAsync(int id)
        {
            return await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .Where(b => b.Id == id)
                .Select(b => new BookDetailsDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Description = b.Description,
                    Price = b.Price,
                    AuthorName = b.Author.Name,
                    CategoryName = b.Category != null ? b.Category.Name : "Без категорії"
                })
                .FirstOrDefaultAsync();
        }

        public async Task<Book> CreateBookAsync(CreateBookDto dto)
        {
            var book = new Book
            {
                Title = dto.Title,
                AuthorId = dto.AuthorId,
                CategoryId = dto.CategoryId,
                Price = dto.Price,
                Description = dto.Description
            };
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task UpdateBookAsync(Book book)
        {
            _context.Entry(book).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book != null)
            {
                _context.Books.Remove(book);
                await _context.SaveChangesAsync();
            }
        }

        public bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }
        public async Task<(string Type, object Content)?> GetBookReadContentAsync(int bookId, int userId, bool isAdmin)
        {
            
            bool hasAccess = await _context.UserBooks
                .AnyAsync(ub => ub.UserId == userId && ub.BookId == bookId);

            if (!hasAccess && !isAdmin) return null; 

            var book = await _context.Books
                .Include(b => b.Chapters)
                .FirstOrDefaultAsync(b => b.Id == bookId);

            if (book == null) return null; 

            if (book.Chapters != null && book.Chapters.Any())
            {
                var chapters = book.Chapters.Select(c => new ChapterListDto
                { Id = c.Id, BookId = c.BookId, Title = c.Title }).ToList();
                return ("Episodic", chapters);
            }
            else if (book.FileContent != null)
            {
                var content = System.Text.Encoding.UTF8.GetString(book.FileContent);
                return ("Simple", new { Content = content, Title = book.Title });
            }

            return ("Empty", null);
        }
    }
}