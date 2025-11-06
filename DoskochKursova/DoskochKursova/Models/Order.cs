using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using DoskochKursova.Books;

namespace DoskochKursova.Models
{
    public class Order
    {
        public int Id { get; set; }

        
        [Required]
        [DataType(DataType.DateTime)]
        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Range(0, 999999)]
        public decimal TotalAmount { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "Pending"; 

        public ICollection<OrderItem> OrderItems { get; set; }
    }

    public class OrderItem
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public Order Order { get; set; }

        [Required]
        public int BookId { get; set; }
        public Book Book { get; set; }

        [Range(1, 100)]
        public int Quantity { get; set; }

        [Range(0, 9999)]
        public decimal Price { get; set; } // Ціна на момент покупки
    }
}
