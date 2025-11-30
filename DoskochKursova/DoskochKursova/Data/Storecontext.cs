using Microsoft.EntityFrameworkCore;
using DoskochKursova.Models;
using BookStore.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using DoskochKursova.Accounting;
using DoskochKursova.Books;
using DoskochKursova.Orders;

namespace DoskochKursova.Data
{

    public class StoreContext : IdentityDbContext<User, Role, int>
    
    {
        public StoreContext(DbContextOptions<StoreContext> options)
            : base(options)
        {
        }

        public DbSet<Author> Authors { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<DoskochKursova.Orders.Order> Orders { get; set; }
        public DbSet<DoskochKursova.Orders.OrderItem> OrderItems { get; set; }

        public DbSet<UserBook> UserBooks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
           
            base.OnModelCreating(modelBuilder);

            
        }
    }
}