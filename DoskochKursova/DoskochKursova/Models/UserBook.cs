using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoskochKursova.Models
{
  
    public class UserBook
    {
        [Key]
        public int Id { get; set; } 

        
        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }
        public virtual User User { get; set; }

      
        [Required]
        [ForeignKey("Book")]
        public int BookId { get; set; }
        public virtual Book Book { get; set; }

        -

        [Required]
        [Display(Name = "Дата покупки")]
        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

      
        [Required]
        [Display(Name = "Ціна покупки")]
        [Column(TypeName = "decimal(18, 2)")] 
        public decimal PurchasePrice { get; set; }
    }
}