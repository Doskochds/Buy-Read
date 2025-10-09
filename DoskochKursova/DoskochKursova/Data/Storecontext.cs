using Microsoft.EntityFrameworkCore;
using BookStore.Models;
using DoskochKursova.Models;
using System.Collections.Generic;

namespace DoskochKursova.Data
{
    public class StoreContext : DbContext
    {
        public StoreContext(DbContextOptions<StoreContext> options)
            : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<Discount> Discounts { get; set; }
    }
}
