using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoskochKursova.Data;
using DoskochKursova.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; 

namespace DoskochKursova.Books
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly StoreContext _context;

        public BooksController(StoreContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Book>>> Index()
        {
            var books = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .ToListAsync();

            return Ok(books);
        }


        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Book>> GetBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (book == null)
            {
                return NotFound();
            }

            return Ok(book);
        }

        [HttpGet("{id}/read")]
        [Authorize] 
        public async Task<IActionResult> GetBookContent(int id)
        {
            // 1. Отримуємо ID користувача з JWT-токена
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);

            
            bool hasAccess = await _context.UserBooks
                .AnyAsync(ub => ub.UserId == userId && ub.BookId == id);

            bool isAdmin = User.IsInRole("Admin");

            if (!hasAccess && !isAdmin)
            {
                return Forbid(); 
            }

            
            var book = await _context.Books
                .Include(b => b.Chapters) 
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound();
            }

            if (book.Chapters != null && book.Chapters.Any())
            {
                
                var chapterList = book.Chapters.Select(c => new ChapterListDto
                {
                    Id = c.Id,
                    BookId = c.BookId,
                    Title = c.Title
                }).ToList();

                return Ok(new { BookType = "Episodic", Chapters = chapterList });
            }
            else if (book.FileContent != null)
            {
                
                var content = System.Text.Encoding.UTF8.GetString(book.FileContent);
                return Ok(new { BookType = "Simple", Content = content, Title = book.Title });

                //потім глянути якщо типу файл
                // return File(book.FileContent, "application/pdf", book.FileName);
            }
            else
            {
                
                return NotFound(new { Message = "Для цієї книги ще не додано контент." });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Book>> Create([FromBody] CreateBookDto bookDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var book = new Book
            {
                Title = bookDto.Title,
                AuthorId = bookDto.AuthorId,
                CategoryId = bookDto.CategoryId,
                Price = bookDto.Price,
                Description = bookDto.Description
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Edit(int id, [FromBody] Book book)
        {
            if (id != book.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(book).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }
    }
}