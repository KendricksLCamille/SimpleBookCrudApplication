using System.ComponentModel.DataAnnotations;
using System.Text;
using Backend;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options => // UseSwaggerUI is called only in Development.
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();


app.MapGet("/api/books", async () =>
{
    await using var db = new BookContext();
    return await db.Books.ToListAsync();
}).WithName("GetAllBooks").WithDescription("Get all books");

app.MapGet("/api/books/{id:guid}", async (Guid id) =>
{
    await using var db = new BookContext();
    var book = await db.Books.FindAsync(id);
    return book!= null ? Results.Ok(book) : Results.NotFound();
}).WithName("GetBook")
    .WithDescription("Get a book by ID")
    .Produces<Book>()
    .Produces(StatusCodes.Status404NotFound);

app.MapPost("/api/books", async (Book book) =>
{
    await using var db = new BookContext();
    if (book.IsNotValidBook(out var validationResult)) return Results.BadRequest(validationResult);
    book.Id = Guid.NewGuid(); // Generate a new ID for the book.
    db.Books.Add(book);
    await db.SaveChangesAsync();
    return Results.Created("/api/books/" + book.Id, book);
}).WithName("AddBook")
    .WithDescription("Add a new book")
    .Produces<Book>(StatusCodes.Status201Created)
    .Produces(StatusCodes.Status400BadRequest);

app.MapPut("/api/books/{id:guid}", async (Guid id, Book book) =>
{
    await using var db = new BookContext();
    if (book.IsNotValidBook(out var validationResult)) return Results.BadRequest(validationResult);
    book.Id = id; // Update the ID of the book.
    db.Entry(book).State = EntityState.Modified;
    await db.SaveChangesAsync();
    return Results.NoContent();
}).WithName("UpdateBook")
    .WithDescription("Updates an existing book by ID")
    .Produces(StatusCodes.Status400BadRequest)
    .Produces<Book>(StatusCodes.Status204NoContent);

app.MapDelete("/api/books/{id:guid}", async (Guid id) =>
{
    await using var db = new BookContext();
    var book = await db.Books.FindAsync(id);
    if (book!= null)
    {
        db.Books.Remove(book);
        await db.SaveChangesAsync();
    }
}).WithName("DeleteBook").WithDescription("Delete a book by ID");

app.MapGet("/api/books/status", async () =>
{
    await using var db = new BookContext();
    var genreToBooksCount = await db.Books.GroupBy(b => b.Genre).ToDictionaryAsync(g => g.Key, g => g.Count());
    return genreToBooksCount;
}).WithName("GetBooksStatus").WithDescription("Get the count of books by genre").Produces<Dictionary<string, int>>();

await using var db = new BookContext();
await db.Database.EnsureCreatedAsync();
if (!await db.Books.AnyAsync())
{
    const int numberOfBooks = 100; // Ensures generating duplicate genres.
    db.AddRange(Enumerable.Range(1, numberOfBooks).Select(_ => Book.Generate()));
}
await db.SaveChangesAsync();

await app.RunAsync();
return;
