using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;


namespace DoskochKursova.Orders
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("buy")]
        public async Task<IActionResult> BuyBooks([FromBody] CreateOrderDto dto)
        {
            // 1. Дістаємо ID користувача з токена
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);

            // 2. Валідація
            if (dto.BookIds == null || !dto.BookIds.Any())
            {
                return BadRequest("Кошик порожній.");
            }

            try
            {
                // 3. Виклик сервісу
                var order = await _orderService.CreateOrderAsync(userId, dto.BookIds);

                return Ok(new
                {
                    Message = "Успішна покупка!",
                    OrderId = order.Id,
                    Total = order.TotalAmount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Помилка при покупці: {ex.Message}");
            }
        }

        [HttpGet("my-history")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null) return Unauthorized();
            var userId = int.Parse(userIdString);

            // Сервіс вже повертає гарні DTO
            var orders = await _orderService.GetUserOrdersAsync(userId);

            return Ok(orders);
        }
    }
}