using System;
using System.Collections.Generic;

namespace DoskochKursova.Orders
{
    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }

        public List<OrderItemDto> Items { get; set; }
    }

    public class OrderItemDto
    {
        public int BookId { get; set; }
        public string BookTitle { get; set; } 
        public string AuthorName { get; set; } 
        public decimal Price { get; set; }    
        public int Quantity { get; set; }
    }
}