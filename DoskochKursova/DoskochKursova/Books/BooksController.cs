using Microsoft.AspNetCore.Mvc;
using DoskochKursova.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> GetBookContent(int id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);
            bool isAdmin = User.IsInRole("Admin");

            var result = await _bookService.GetBookReadContentAsync(id, userId, isAdmin);

            if (result == null) return Forbid(); 

            if (result.Value.Type == "Empty")
                return NotFound(new { Message = "Контент ще не додано." });

            return Ok(new { BookType = result.Value.Type, Data = result.Value.Content });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Create([FromBody] CreateBookDto bookDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var book = await _bookService.CreateBookAsync(bookDto);
            return Ok(new { Message = "Книгу створено", BookId = book.Id });
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