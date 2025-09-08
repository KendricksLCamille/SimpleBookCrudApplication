using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints;

public static class BooksApi
{
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
            .WithSummary("Update an existing book")
            .WithDescription("Updates an existing book by ID. Returns 204 No Content on success, 400 for validation errors.")
            .Accepts<Book>("application/json")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest);

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
            .WithSummary("Delete a book")
            .WithDescription("Deletes a book by ID. Returns 204 No Content whether or not the book existed.")
            .Produces(StatusCodes.Status204NoContent);

        group.MapGet("/stats", async (BookContext db) =>
            {
                var genreToBooksCount = await db.Books
                    .GroupBy(b => b.Genre)
                    .ToDictionaryAsync(g => g.Key, g => g.Count());
                return genreToBooksCount;
            })
            .WithName("GetBooksStats")
            .WithTags("Books")
            .WithSummary("Get book statistics by genre")
            .WithDescription("Returns a dictionary of Genre -> Count of books.")
            .Produces<Dictionary<string, int>>(StatusCodes.Status200OK, contentType: "application/json");

        return app;
    }
}
