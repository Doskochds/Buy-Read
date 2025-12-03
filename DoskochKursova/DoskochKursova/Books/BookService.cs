using Microsoft.EntityFrameworkCore;
using DoskochKursova.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using DoskochKursova.Models;
using System;

namespace DoskochKursova.Books
{
    public class BookService : IBookService
    {
        private readonly StoreContext _context;
        private readonly IWebHostEnvironment _environment;

        public BookService(StoreContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
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
                Description = b.Description,
                CoverImagePath = b.CoverImagePath
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
                    CategoryName = b.Category != null ? b.Category.Name : "Без категорії",
                    CoverImagePath = b.CoverImagePath
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
                Description = dto.Description,
            };

            // 1. Обкладинка (на диск)
            if (dto.CoverImage != null)
            {
                string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.CoverImage.FileName);
                string uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "covers");

                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.CoverImage.CopyToAsync(fileStream);
                }

                book.CoverImagePath = "/uploads/covers/" + uniqueFileName;
            }

            // 2. Файл книги (в БД як байти)
            if (dto.BookFile != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await dto.BookFile.CopyToAsync(memoryStream);
                    book.FileContent = memoryStream.ToArray();
                }
                book.FileName = dto.BookFile.FileName;
            }

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
                if (!string.IsNullOrEmpty(book.CoverImagePath))
                {
                    // Тут можна додати видалення картинки з диска, якщо треба
                }
                _context.Books.Remove(book);
                await _context.SaveChangesAsync();
            }
        }

        public bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }

        // --- ЛОГІКА ВИЗНАЧЕННЯ ТИПУ ДЛЯ ФРОНТЕНДА ---
        public async Task<(string Type, object Content)?> GetBookReadContentAsync(int bookId, int userId, bool isAdmin)
        {
            bool hasAccess = await _context.UserBooks
                .AnyAsync(ub => ub.UserId == userId && ub.BookId == bookId);

            if (!hasAccess && !isAdmin) return null;

            var book = await _context.Books
                .Include(b => b.Chapters)
                .FirstOrDefaultAsync(b => b.Id == bookId);

            if (book == null) return null;

            // ПРІОРИТЕТ 1: Якщо є глави (створені адміном вручну) -> Це Інтерактивна книга
            if (book.Chapters != null && book.Chapters.Any())
            {
                var chapters = book.Chapters.Select(c => new ChapterListDto
                {
                    Id = c.Id,
                    BookId = c.BookId,
                    Title = c.Title
                }).ToList();

                return ("Episodic", chapters);
            }

            // ПРІОРИТЕТ 2: Якщо глав немає, але є файл -> Це Файлова книга
            else if (book.FileContent != null)
            {
                return ("File", new
                {
                    Message = "Ця книга доступна у форматі файлу.",
                    FileName = book.FileName,
                    // Формуємо URL для скачування
                    DownloadUrl = $"/api/Books/{book.Id}/download"
                });
            }

            return ("Empty", null);
        }

        // --- ТУТ ТЕПЕР ЗАВЖДИ ПРОСТО ЗБЕРІГАЄМО ФАЙЛ ---
        public async Task UploadFileAsync(int id, IFormFile file)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return;

            // Більше ніяких перевірок на .txt
            // Будь-який файл зберігаємо як бінарник для скачування
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                book.FileContent = memoryStream.ToArray();
                book.FileName = file.FileName;
            }

            // Оновлюємо запис в БД
            _context.Entry(book).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task<(byte[] Content, string FileName)?> GetFileAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null || book.FileContent == null) return null;
            return (book.FileContent, book.FileName ?? "book.bin");
        }
    }
}