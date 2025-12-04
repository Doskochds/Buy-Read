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
using System.Text;
using UglyToad.PdfPig;
using VersOne.Epub;
using DoskochKursova.Translation;

namespace DoskochKursova.Books
{
    public class BookService : IBookService
    {
        private readonly StoreContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ITranslationService _translationService;

        public BookService(StoreContext context, IWebHostEnvironment environment, ITranslationService translationService)
        {
            _context = context;
            _environment = environment;
            _translationService = translationService;
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
                _context.Books.Remove(book);
                await _context.SaveChangesAsync();
            }
        }

        public bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }

        public async Task<(string Type, object Content)?> GetBookReadContentAsync(int bookId, int userId, bool isAdmin, string? lang = "uk")
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
                {
                    Id = c.Id,
                    BookId = c.BookId,
                    Title = c.Title
                }).ToList();

                return ("Episodic", chapters);
            }
            else if (book.FileContent != null)
            {
                string extension = Path.GetExtension(book.FileName)?.ToLower();
                string extractedText = "";

                try
                {
                    if (extension == ".txt")
                    {
                        var rawText = Encoding.UTF8.GetString(book.FileContent);
                        extractedText = $@"
                            <div style='
                                white-space: pre-wrap; 
                                text-align: left; 
                                font-family: Consolas, monospace; 
                                font-size: 16px; 
                                line-height: 1.5; 
                                color: #333;'>
                            {rawText}
                            </div>";
                    }
                    else if (extension == ".pdf")
                    {
                        using (var stream = new MemoryStream(book.FileContent))
                        {
                            using (var document = PdfDocument.Open(stream))
                            {
                                var sb = new StringBuilder();

                                foreach (var page in document.GetPages())
                                {
                                    var pageWidth = page.Width;
                                    var words = page.GetWords().ToList();

                                    var lines = words
                                        .GroupBy(w => Math.Round(w.BoundingBox.Bottom / 5.0) * 5.0)
                                        .OrderByDescending(g => g.Key);

                                    foreach (var lineGroup in lines)
                                    {
                                        var lineText = string.Join(" ", lineGroup.Select(w => w.Text));
                                        if (string.IsNullOrWhiteSpace(lineText)) continue;

                                        var left = lineGroup.Min(w => w.BoundingBox.Left);
                                        var right = lineGroup.Max(w => w.BoundingBox.Right);
                                        var lineWidth = right - left;

                                        var lineCenter = left + (lineWidth / 2);
                                        var pageCenter = pageWidth / 2;

                                        bool isCentered = Math.Abs(pageCenter - lineCenter) < 30;
                                        bool isShortLine = lineWidth < (pageWidth * 0.6);

                                        if (isCentered && isShortLine)
                                        {
                                            sb.AppendLine($"<p style='text-align: center; font-weight: bold; margin-top: 15px; margin-bottom: 10px; color: #000;'>{lineText}</p>");
                                        }
                                        else
                                        {
                                            sb.AppendLine($"<p style='text-align: justify; text-indent: 20px; margin-bottom: 5px;'>{lineText}</p>");
                                        }
                                    }
                                    sb.AppendLine("<hr style='margin: 20px 0; border: 0; border-top: 1px dashed #ddd;'/>");
                                }
                                extractedText = sb.ToString();
                            }
                        }
                    }
                    else if (extension == ".epub")
                    {
                        using (var stream = new MemoryStream(book.FileContent))
                        {
                            EpubBook epub = EpubReader.ReadBook(stream);
                            var sb = new StringBuilder();
                            foreach (EpubLocalTextContentFile textContentFile in epub.ReadingOrder)
                            {
                                sb.AppendLine(textContentFile.Content);
                            }
                            extractedText = sb.ToString();
                        }
                    }
                    else
                    {
                        return ("File", new
                        {
                            Message = "Цей формат не підтримує читання текстом. Будь ласка, завантажте файл.",
                            FileName = book.FileName,
                            DownloadUrl = $"/api/Books/{book.Id}/download"
                        });
                    }

                    if (!string.IsNullOrEmpty(lang) && lang != "uk")
                    {
                        extractedText = await _translationService.TranslateAsync(extractedText, lang);
                    }

                    return ("RawText", extractedText);

                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Помилка читання файлу: {ex.Message}");

                    return ("File", new
                    {
                        Message = "Не вдалося конвертувати книгу в текст. Ви можете завантажити файл.",
                        FileName = book.FileName,
                        DownloadUrl = $"/api/Books/{book.Id}/download"
                    });
                }
            }

            return ("Empty", null);
        }

        public async Task UploadFileAsync(int id, IFormFile file)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return;

            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                book.FileContent = memoryStream.ToArray();
                book.FileName = file.FileName;
            }

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