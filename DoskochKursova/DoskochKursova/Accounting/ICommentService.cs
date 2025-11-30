using DoskochKursova.Accounting;


namespace DoskochKursova.Accounting
{
    public interface ICommentService
    {
        Task AddCommentAsync(int userId, CreateCommentDto dto);
        Task<IEnumerable<CommentDto>> GetCommentsByBookIdAsync(int bookId);
    }
}