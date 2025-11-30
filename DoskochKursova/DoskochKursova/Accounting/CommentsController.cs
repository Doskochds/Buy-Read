using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using DoskochKursova.Accounting;

namespace DoskochKursova.Accounting
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetBookComments(int bookId)
        {
            var comments = await _commentService.GetCommentsByBookIdAsync(bookId);
            return Ok(comments);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);

            await _commentService.AddCommentAsync(userId, dto);

            return Ok(new { Message = "Коментар додано!" });
        }
    }
}