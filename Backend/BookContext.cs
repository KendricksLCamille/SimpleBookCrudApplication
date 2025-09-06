using Microsoft.EntityFrameworkCore;

namespace Backend;

internal class BookContext : DbContext
{
    public DbSet<Book> Books { get; set; }
    private string DbPath { get; }

    public BookContext()
    {
        var path = Path.GetTempPath();
        DbPath = Path.Join(path, "book.db");
    }

    // The following configured EF to create a Sqlite database file in the
    // special "local" folder for your platform.
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlite($"Data Source={DbPath}");
}