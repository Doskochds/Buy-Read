using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Models
{
    public class Book
    {
        public int Id { get; set; }

        [Required, StringLength(150)]
        public string Title { get; set; }

        [Required]
        public int AuthorId { get; set; }
        public Author Author { get; set; }

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        [Range(0, 9999)]
        public decimal Price { get; set; }

        [Display(Name = "Discount (%)")]
        [Range(0, 100)]
        public int? DiscountPercent { get; set; }

        [DataType(DataType.MultilineText)]
        public string? Description { get; set; }

        
        [Display(Name = "Book File")]
        public byte[]? FileContent { get; set; }

        [Display(Name = "File Name")]
        public string? FileName { get; set; }

        public ICollection<Chapter>? Chapters { get; set; }
    }
}
