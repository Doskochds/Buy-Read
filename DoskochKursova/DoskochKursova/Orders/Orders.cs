using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DoskochKursova.Books; 
using DoskochKursova.Accounting; 

namespace DoskochKursova.Orders
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalAmount { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "Completed"; 
        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }


        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }

    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }

        [Required]
        public int BookId { get; set; }

        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }

        public int Quantity { get; set; } = 1;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }
    }
}