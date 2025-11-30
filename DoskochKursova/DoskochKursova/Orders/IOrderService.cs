
using DoskochKursova.Orders;

namespace DoskochKursova.Orders
{
    public interface IOrderService
    {
        Task<DoskochKursova.Orders.Order> CreateOrderAsync(int userId, List<int> bookIds);

        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId);
    }
}