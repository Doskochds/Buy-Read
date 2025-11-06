using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Books
{
    public class CreateBookDto
    {
        [Required, StringLength(150)]
        public string Title { get; set; }

        [Required]
        public int AuthorId { get; set; }

        public int? CategoryId { get; set; }

        [Range(0, 9999)]
        public decimal Price { get; set; }

        public string? Description { get; set; }
    }
}
