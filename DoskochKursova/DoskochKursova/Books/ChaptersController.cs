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
    public class ChaptersController : ControllerBase
    {
        private readonly StoreContext _context;

        public ChaptersController(StoreContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Author")]
        public async Task<ActionResult<Chapter>> AddChapter([FromBody] CreateChapterDto chapterDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var book = await _context.Books.FindAsync(chapterDto.BookId);
            if (book == null)
            {
                return NotFound(new { Message = $"Книги з ID {chapterDto.BookId} не знайдено." });
            }

            var chapter = new Chapter
            {
                BookId = chapterDto.BookId,
                Title = chapterDto.Title,
                Content = chapterDto.Content
            };

            _context.Chapters.Add(chapter);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChapterContent), new { id = chapter.Id }, chapter);
        }

        [HttpGet("book/{bookId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ChapterListDto>>> GetChapterList(int bookId)
        {
            var chapters = await _context.Chapters
                .Where(c => c.BookId == bookId)
                .Select(c => new ChapterListDto
                {
                    Id = c.Id,
                    BookId = c.BookId,
                    Title = c.Title
                })
                .ToListAsync();

            if (!chapters.Any())
            {
                return NotFound(new { Message = "Для цієї книги ще не додано глав." });
            }

            return Ok(chapters);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Chapter>> GetChapterContent(int id)
        {
            var chapter = await _context.Chapters.FindAsync(id);
            if (chapter == null)
            {
                return NotFound();
            }

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdString);

            bool hasAccess = await _context.UserBooks
                .AnyAsync(p =>
                    p.UserId == userId &&
                    p.BookId == chapter.BookId
                );

            bool isAdmin = User.IsInRole("Admin");

            if (!hasAccess && !isAdmin)
            {
                return Forbid();
            }

            return Ok(chapter);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Author")] 
        public async Task<IActionResult> EditChapter(int id, [FromBody] EditChapterDto chapterDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var chapter = await _context.Chapters.FindAsync(id);
            if (chapter == null)
            {
                return NotFound();
            }

            chapter.Title = chapterDto.Title;
            chapter.Content = chapterDto.Content;

            _context.Entry(chapter).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Chapters.Any(e => e.Id == id))
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
        [Authorize(Roles = "Admin, Author")] 
        public async Task<IActionResult> DeleteChapter(int id)
        {
            var chapter = await _context.Chapters.FindAsync(id);
            if (chapter == null)
            {
                return NotFound();
            }


            _context.Chapters.Remove(chapter);
            await _context.SaveChangesAsync();

            return NoContent(); 
        }
    }
}