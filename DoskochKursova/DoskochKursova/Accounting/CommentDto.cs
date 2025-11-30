using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Accounting
{
    
    public class CommentDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Text { get; set; }
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCommentDto
    {
        [Required]
        public int BookId { get; set; }

        [Required]
        public string Text { get; set; }

        [Range(1, 10)]
        public int Rating { get; set; }
    }
}