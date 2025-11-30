using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DoskochKursova.Books; 
using DoskochKursova.Accounting; 

namespace DoskochKursova.Accounting
{
    public class Comment
    {
        public int Id { get; set; }

        [Required]
        public string Text { get; set; }

        [Range(1, 10)]
        public int Rating { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public int BookId { get; set; }
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }
    }
}