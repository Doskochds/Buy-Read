using System.ComponentModel.DataAnnotations;
namespace DoskochKursova.Books
{
    public class CreateChapterDto
    {
        [Required]
        public int BookId { get; set; }

        [Required, StringLength(150)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
    }
}
