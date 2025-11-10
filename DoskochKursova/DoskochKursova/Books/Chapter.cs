using DoskochKursova.Models;
using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Books
{
    public class Chapter
    {
        public int Id { get; set; }

        [Required]
        public int BookId { get; set; }
        public Book Book { get; set; }

        [Required, StringLength(150)]
        public string Title { get; set; }

        [DataType(DataType.MultilineText)]
        public string Content { get; set; }
    }
}
