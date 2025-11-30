using Microsoft.EntityFrameworkCore;
using DoskochKursova.Data;
using DoskochKursova.Models;
using DoskochKursova.Books;
using DoskochKursova.Orders;

namespace DoskochKursova.Orders // Або DoskochKursova.Services
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
            // 1. Починаємо транзакцію (щоб або все купилося, або нічого)
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = new DoskochKursova.Orders.Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = "Completed", // Для цифрових товарів одразу виконано
                    OrderItems = new List<OrderItem>()
                };

                decimal totalAmount = 0;

                // 2. Проходимо по кожній книзі зі списку
                foreach (var bookId in bookIds)
                {
                    var book = await _context.Books.FindAsync(bookId);

                    if (book == null) continue; // Якщо книги не існує - пропускаємо

                    // Додаємо запис у чек (OrderItem)
                    var orderItem = new OrderItem
                    {
                        BookId = bookId,
                        Price = book.Price, // Фіксуємо ціну на момент покупки!
                        Quantity = 1
                    };
                    order.OrderItems.Add(orderItem);
                    totalAmount += book.Price;

                    // 3. НАДАЄМО ДОСТУП (UserBook)
                    // Спочатку перевіряємо, чи юзер вже не купив цю книгу раніше
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

                // 4. Зберігаємо все в БД
                _context.Orders.Add(order);
                await _context.SaveChangesAsync(); // Зберігає і Order, і Items, і UserBooks

                // Підтверджуємо транзакцію
                await transaction.CommitAsync();

                return order;
            }
            catch (Exception)
            {
                // Якщо помилка - скасовуємо все
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate) // Спочатку нові замовлення
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    // Мапимо список книг всередині замовлення
                    Items = o.OrderItems.Select(oi => new OrderItemDto
                    {
                        BookTitle = oi.Book.Title,
                        AuthorName = oi.Book.Author.Name, // Достаємо ім'я автора через книгу
                        Price = oi.Price,
                        Quantity = oi.Quantity
                    }).ToList()
                })
                .ToListAsync();
        }
    }
}