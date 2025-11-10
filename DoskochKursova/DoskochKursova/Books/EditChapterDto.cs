using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Books 
{
    public class EditChapterDto
    {
        [Required, StringLength(150)]
        public string Title { get; set; }

        [Required]
        [DataType(DataType.MultilineText)]
        public string Content { get; set; }


    }
}