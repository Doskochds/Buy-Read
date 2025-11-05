using DoskochKursova.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using DoskochKursova.Accounting;

var builder = WebApplication.CreateBuilder(args);


var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("https://localhost:5173",
                                "http://localhost:5173",
                                "https://localhost:44445",
                                "http://localhost:44445")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<StoreContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 33))
    ));

builder.Services.AddIdentity<User, Role>(options =>
{
    options.SignIn.RequireConfirmedAccount = true; 
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<StoreContext>() 
.AddDefaultTokenProviders(); 


var app = builder.Build();


if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization(); 
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();