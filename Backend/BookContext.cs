using Microsoft.EntityFrameworkCore;

namespace Backend;

internal class BookContext(DbContextOptions<BookContext> options) : DbContext(options)
{
    public DbSet<Book> Books { get; set; }
}