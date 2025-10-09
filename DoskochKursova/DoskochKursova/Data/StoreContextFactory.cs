using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DoskochKursova.Data
{
    public class BookStoreContextFactory : IDesignTimeDbContextFactory<StoreContext>
    {
        public StoreContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<StoreContext>();
            optionsBuilder.UseMySql(
                "server=localhost;user=root;database=buy&read;password=OpppoA31",
                new MySqlServerVersion(new Version(8, 0, 33))
            );

            return new StoreContext(optionsBuilder.Options);
        }
    }
}
