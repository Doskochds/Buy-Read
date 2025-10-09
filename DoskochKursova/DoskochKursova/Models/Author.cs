using DoskochKursova.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Models
{
    public class Author
    {
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string Name { get; set; }

        [DataType(DataType.MultilineText)]
        public string? Biography { get; set; }

        public ICollection<Book>? Books { get; set; }
    }
}
