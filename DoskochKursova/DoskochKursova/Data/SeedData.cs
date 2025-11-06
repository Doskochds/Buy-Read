using DoskochKursova.Accounting;
using DoskochKursova.Data;
using DoskochKursova.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DoskochKursova.Data
{
  
    public static class SeedData
    {
      
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<StoreContext>();
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();

            
            if (await roleManager.Roles.AnyAsync())
            {
                return; 
            }

            
            await roleManager.CreateAsync(new Role { Name = "Admin", Description = "Адміністратор" });
            await roleManager.CreateAsync(new Role { Name = "User", Description = "Звичайний користувач" });
            await roleManager.CreateAsync(new Role { Name = "Author", Description = "Автор твору, який хоче його опублікувати на сайті" });
            
            var adminUser = new User
            {
                UserName = "admintest",
                Email = "admin@buyread.com",
                EmailConfirmed = true, 
                RegistrationDate = DateTime.UtcNow,
                Status = "Active"
            };

            await userManager.CreateAsync(adminUser, "Filmor2006."); 
            await userManager.AddToRoleAsync(adminUser, "Admin");

            
            if (!await context.Categories.AnyAsync())
            {
                var categories = new[]
                {
                    new Category { Name = "Фантастика" },
                    new Category { Name = "Детектив" },
                    new Category { Name = "Наукова література" }
                };
                await context.Categories.AddRangeAsync(categories);
            }

            
            if (!await context.Authors.AnyAsync())
            {
                var authors = new[]
                {
                    new Author { Name = "Айзек Азімов", Biography = "..." },
                    new Author { Name = "Агата Крісті", Biography = "..." }
                };
                await context.Authors.AddRangeAsync(authors);
            }

            
            await context.SaveChangesAsync();

            
            if (!await context.Books.AnyAsync())
            {
                var asimov = await context.Authors.FirstAsync(a => a.Name == "Айзек Азімов");
                var christie = await context.Authors.FirstAsync(a => a.Name == "Агата Крісті");

                var fantasy = await context.Categories.FirstAsync(c => c.Name == "Фантастика");
                var detective = await context.Categories.FirstAsync(c => c.Name == "Детектив");

                var books = new[]
                {
                    new Book
                    {
                        Title = "Фундація",
                        AuthorId = asimov.Id,
                        CategoryId = fantasy.Id,
                        Price = 150,
                        Description = "..."
                    },
                    new Book
                    {
                        Title = "Вбивство у «Східному експресі»",
                        AuthorId = christie.Id,
                        CategoryId = detective.Id,
                        Price = 120,
                        Description = "..."
                    }
                };
                await context.Books.AddRangeAsync(books);
            }

            await context.SaveChangesAsync();
        }
    }
}