using DoskochKursova.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// *** 1. ���Բ����ֲ� CORS ***
// ��������� ���� �������
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// ��������� ������ CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            // ���������� ������ � �����, �� �������� ������ React/Angular, 
            // �� ���������� ����-��� ������� ��� ��������� ���������� ����������.
            // � PRODUCTION ������� �������� ���� �������� ������!
            policy.WithOrigins("https://localhost:5173",
                               "http://localhost:5173",
                               "https://localhost:44445", // ������� ���� ��� �볺������ ������� � SPA-��������
                               "http://localhost:44445")
                  .AllowAnyHeader()
                  .AllowAnyMethod();

            // ���� �� �� ����� ���� �볺���, ������ ��������������� ���������:
            // policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        });
});
// ****************************


// ��������� ������ ���������� (��� MVC �� API)
builder.Services.AddControllersWithViews();

// ������������ MySQL DbContext
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

// *** 2. ������������ CORS ***
// �� �� ���� �� UseRouting � UseAuthorization
app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

// ��������� ����������. ControllersWithViews ������� ������ ����.
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// API endpoints ������ �������� ����������� ������� [Route("api/[controller]")]
// � BooksApiController.

app.Run();
