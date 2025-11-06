using DoskochKursova.Books;
using System;
using System.ComponentModel.DataAnnotations;

namespace BookStore.Models
{
    public class Discount
    {
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string Name { get; set; }

        [Range(0, 100)]
        public int Percent { get; set; }

        [DataType(DataType.Date)]
        public DateTime StartDate { get; set; }

        [DataType(DataType.Date)]
        public DateTime EndDate { get; set; }

        public int? BookId { get; set; }
        //public Book? Book { get; set; }
    }
}
