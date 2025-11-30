using Microsoft.EntityFrameworkCore;
using DoskochKursova.Data;
using DoskochKursova.Accounting;

namespace DoskochKursova.Accounting
{
    public class CommentService : ICommentService
    {
        private readonly StoreContext _context;

        public CommentService(StoreContext context)
        {
            _context = context;
        }

        public async Task AddCommentAsync(int userId, CreateCommentDto dto)
        {
            var comment = new Comment
            {
                BookId = dto.BookId,
                UserId = userId,
                Text = dto.Text,
                Rating = dto.Rating,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);

            // await UpdateBookAverageRating(dto.BookId); 

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<CommentDto>> GetCommentsByBookIdAsync(int bookId)
        {
            return await _context.Comments
                .Where(c => c.BookId == bookId)
                .Include(c => c.User) 
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    UserName = c.User.UserName, // Беремо логін з підключеної таблиці
                    Text = c.Text,
                    Rating = c.Rating,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }
    }
}