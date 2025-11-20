using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoskochKursova.Data;
using DoskochKursova.Models;

namespace DoskochKursova.Books
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly StoreContext _context;

        public CategoriesController(StoreContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCategories()
        {
            // Повертаємо ID і Назву для випадаючого списку
            return await _context.Categories
                .Select(c => new { c.Id, c.Name })
                .ToListAsync();
        }
    }
}