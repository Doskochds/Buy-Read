using Microsoft.AspNetCore.Mvc;
using DoskochKursova.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http; // Для IFormFile
using System.Threading.Tasks;
using System.Collections.Generic;

namespace DoskochKursova.Books
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<BookListDto>>> Index(
            [FromQuery] string? searchTerm,
            [FromQuery] int? categoryId)
        {
            var books = await _bookService.GetAllBooksAsync(searchTerm, categoryId);
            return Ok(books);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<BookDetailsDto>> GetBook(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);

            if (book == null)
            {
                return NotFound();
            }
            return Ok(book);
        }

        [HttpGet("{id}/read")]
        [Authorize]
        public async Task<IActionResult> GetBookContent(int id, [FromQuery] string? lang = "uk")
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);
            bool isAdmin = User.IsInRole("Admin");

            var result = await _bookService.GetBookReadContentAsync(id, userId, isAdmin, lang);

            if (result == null) return Forbid();

            if (result.Value.Type == "Empty")
                return NotFound(new { Message = "Контент ще не додано." });

            return Ok(new { BookType = result.Value.Type, Data = result.Value.Content });
        }

        [HttpPost("{id}/upload")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadBookFile(int id, IFormFile file)
        {
            if (!_bookService.BookExists(id)) return NotFound();

            if (file == null || file.Length == 0)
                return BadRequest("Файл пустий");

            await _bookService.UploadFileAsync(id, file);

            return Ok(new { Message = $"Файл {file.FileName} успішно завантажено!" });
        }

        [HttpGet("{id}/download")]
        [Authorize]
        public async Task<IActionResult> DownloadBookFile(int id)
        {
            var fileData = await _bookService.GetFileAsync(id);
            if (fileData == null) return NotFound("Файл не знайдено");

            return File(fileData.Value.Content, "application/octet-stream", fileData.Value.FileName);
        }

        // ОСЬ ТУТ: Метод створення став дуже простим
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Create([FromForm] CreateBookDto bookDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Вся магія з файлами відбувається всередині сервісу
            var book = await _bookService.CreateBookAsync(bookDto);

            return Ok(new
            {
                Message = "Книгу створено",
                BookId = book.Id,
                CoverUrl = book.CoverImagePath // Повертаємо URL, щоб фронт відразу міг показати
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Edit(int id, [FromBody] Book book)
        {
            if (id != book.Id) return BadRequest();

            try
            {
                await _bookService.UpdateBookAsync(book);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_bookService.BookExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            if (!_bookService.BookExists(id))
            {
                return NotFound();
            }

            await _bookService.DeleteBookAsync(id);
            return NoContent();
        }
    }
}