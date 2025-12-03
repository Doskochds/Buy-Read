using Microsoft.EntityFrameworkCore;
using DoskochKursova.Data;
using DoskochKursova.Models;
using DoskochKursova.Books;
using DoskochKursova.Orders;

namespace DoskochKursova.Orders 
{
    public class OrderService : IOrderService
    {
        private readonly StoreContext _context;

        public OrderService(StoreContext context)
        {
            _context = context;
        }

        public async Task<DoskochKursova.Orders.Order> CreateOrderAsync(int userId, List<int> bookIds)
        {

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = new DoskochKursova.Orders.Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = "Completed", 
                    OrderItems = new List<OrderItem>()
                };

                decimal totalAmount = 0;

                foreach (var bookId in bookIds)
                {
                    var book = await _context.Books.FindAsync(bookId);

                    if (book == null) continue; 
                    var orderItem = new OrderItem
                    {
                        BookId = bookId,
                        Price = book.Price, 
                        Quantity = 1
                    };
                    order.OrderItems.Add(orderItem);
                    totalAmount += book.Price;

                    bool alreadyOwned = await _context.UserBooks
                        .AnyAsync(ub => ub.UserId == userId && ub.BookId == bookId);

                    if (!alreadyOwned)
                    {
                        _context.UserBooks.Add(new UserBook
                        {
                            UserId = userId,
                            BookId = bookId,
                            PurchasePrice = book.Price,
                            PurchaseDate = DateTime.UtcNow
                        });
                    }
                }

                order.TotalAmount = totalAmount;

                _context.Orders.Add(order);
                await _context.SaveChangesAsync(); 
                await transaction.CommitAsync();

                return order;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate) 
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    Items = o.OrderItems.Select(oi => new OrderItemDto
                    {
                        BookId = oi.BookId,
                        BookTitle = oi.Book.Title,
                        AuthorName = oi.Book.Author.Name, 
                        Price = oi.Price,
                        Quantity = oi.Quantity
                    }).ToList()
                })
                .ToListAsync();
        }
    }
}