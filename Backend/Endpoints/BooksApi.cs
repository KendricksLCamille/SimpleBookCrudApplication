using Microsoft.EntityFrameworkCore;
using Backend.Dtos;

namespace Backend.Endpoints;

public static class BooksApi
{
    // Compiled projection query for stats (null-safe Genre)
    private static readonly Func<BookContext, IEnumerable<GenreCount>> s_getGenreCountsQuery =
        EF.CompileQuery((BookContext ctx) =>
            ctx.Books
               .AsNoTracking()
               .GroupBy(b => b.Genre ?? "Unknown")
               .Select(g => new GenreCount(g.Key, g.Count()))
        );

    public static IEndpointRouteBuilder MapBooksApi(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/books");

        group.MapGet("/", async (BookContext db) => await db.Books.ToListAsync())
            .WithName("GetAllBooks")
            .WithTags("Books")
            .WithSummary("List all books")
            .WithDescription("Returns the full list of books.")
            .Produces<List<Book>>(StatusCodes.Status200OK, contentType: "application/json");

        group.MapGet("/{id:guid}", async (Guid id, BookContext db) =>
            {
                var book = await db.Books.FindAsync(id);
                return book != null ? Results.Ok(book) : Results.NotFound();
            })
            .WithName("GetBook")
            .WithTags("Books")
            .WithSummary("Get a book by ID")
            .WithDescription("Returns a single book when it exists; 404 when not found.")
            .Produces<Book>(StatusCodes.Status200OK, contentType: "application/json")
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", async (Book book, BookContext db) =>
            {
                if (book.IsNotValidBook(out var validationResult)) return Results.BadRequest(validationResult);
                book.Id = Guid.NewGuid();
                db.Books.Add(book);
                await db.SaveChangesAsync();
                return Results.Created($"/api/books/{book.Id}", book);
            })
            .WithName("AddBook")
            .WithTags("Books")
            .WithSummary("Create a new book")
            .WithDescription("Creates a new book and returns it with Location header pointing to the new resource.")
            .Accepts<Book>("application/json")
            .Produces<Book>(StatusCodes.Status201Created, contentType: "application/json")
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", async (Guid id, Book book, BookContext db) =>
            {
                if (book.IsNotValidBook(out var validationResult)) return Results.BadRequest(validationResult);
                book.Id = id;
                db.Entry(book).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Results.NoContent();
            })
            .WithName("UpdateBook")
            .WithTags("Books")
            .WithDescription("Updates an existing book by ID")
            .Produces(StatusCodes.Status400BadRequest)
            .Produces<Book>(StatusCodes.Status204NoContent);

        group.MapDelete("/{id:guid}", async (Guid id, BookContext db) =>
            {
                var book = await db.Books.FindAsync(id);
                if (book == null) return Results.NoContent();
                db.Books.Remove(book);
                await db.SaveChangesAsync();
                return Results.NoContent();
            })
            .WithName("DeleteBook")
            .WithTags("Books")
            .WithDescription("Delete a book by ID");

        group.MapGet("/stats", (BookContext db) =>
            {
                // Use projection and compiled query; group key is null-safe
                var list = s_getGenreCountsQuery(db).ToList();
                var dict = list.ToDictionary(x => x.Genre, x => x.Count);
                return dict;
            })
            .WithName("GetBooksStats")
            .WithTags("Books")
            .WithDescription("Get the count of books by genre (null-safe)")
            .Produces<Dictionary<string, int>>();

        return app;
    }
}
