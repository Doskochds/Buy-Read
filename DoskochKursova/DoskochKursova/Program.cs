using DoskochKursova.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// *** 1. КОНФІГУРАЦІЯ CORS ***
// Створення імені політики
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// Додавання сервісу CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            // Дозволяємо доступ з портів, де зазвичай працює React/Angular, 
            // та дозволяємо будь-яке джерело для спрощення локального тестування.
            // У PRODUCTION потрібно залишити лише конкретні домени!
            policy.WithOrigins("https://localhost:5173",
                               "http://localhost:5173",
                               "https://localhost:44445", // Типовий порт для клієнтської частини в SPA-шаблонах
                               "http://localhost:44445")
                  .AllowAnyHeader()
                  .AllowAnyMethod();

            // Якщо ви не знаєте порт клієнта, можете використовувати тимчасово:
            // policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        });
});
// ****************************


// Додавання сервісів контролерів (для MVC та API)
builder.Services.AddControllersWithViews();

// Конфігурація MySQL DbContext
builder.Services.AddDbContext<StoreContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 33))
    ));


var app = builder.Build();


if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// *** 2. ЗАСТОСУВАННЯ CORS ***
// Це має бути між UseRouting і UseAuthorization
app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

// Реєстрація контролерів. ControllersWithViews підтримує обидва типи.
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// API endpoints будуть мапитися автоматично завдяки [Route("api/[controller]")]
// в BooksApiController.

app.Run();
