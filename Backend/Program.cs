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
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

// Database connection string from configuration
var connectionString = builder.Configuration.GetConnectionString("Default")
                      ?? "Data Source=book.db";

builder.Services.AddDbContext<BookContext>(options => options.UseSqlite(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ConfiguredCorsPolicy", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.AllowAnyOrigin();
        }
        else
        {
            policy.WithOrigins(allowedOrigins);
        }
        policy.AllowAnyHeader().AllowAnyMethod();
    });
});
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
app.UseCors("ConfiguredCorsPolicy");


app.MapGet("/api/books", async (BookContext db) =>
{
    return await db.Books.ToListAsync();
}).WithName("GetAllBooks")
  .WithTags("Books")
  .WithSummary("List all books")
  .WithDescription("Returns the full list of books.")
  .Produces<List<Book>>(StatusCodes.Status200OK, contentType: "application/json");

app.MapGet("/api/books/{id:guid}", async (Guid id, BookContext db) =>
    {
        var book = await db.Books.FindAsync(id);
        return book != null ? Results.Ok(book) : Results.NotFound();
    }).WithName("GetBook")
    .WithTags("Books")
    .WithSummary("Get a book by ID")
    .WithDescription("Returns a single book when it exists; 404 when not found.")
    .Produces<Book>(StatusCodes.Status200OK, contentType: "application/json")
    .Produces(StatusCodes.Status404NotFound);

app.MapPost("/api/books", async (Book book, BookContext db) =>
    {
        if (book.IsNotValidBook(out var validationResult)) return Results.BadRequest(validationResult);
        book.Id = Guid.NewGuid(); // Generate a new ID for the book.
        db.Books.Add(book);
        await db.SaveChangesAsync();
        return Results.Created("/api/books/" + book.Id, book);
    }).WithName("AddBook")
    .WithTags("Books")
    .WithSummary("Create a new book")
    .WithDescription("Creates a new book and returns it with Location header pointing to the new resource.")
    .Accepts<Book>("application/json")
    .Produces<Book>(StatusCodes.Status201Created, contentType: "application/json")
    .Produces(StatusCodes.Status400BadRequest);

app.MapPut("/api/books/{id:guid}", async (Guid id, Book book, BookContext db) =>
    {
        if (book.IsNotValidBook(out var validationResult)) return Results.BadRequest(validationResult);
        book.Id = id; // Update the ID of the book.
        db.Entry(book).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }).WithName("UpdateBook")
    .WithTags("Books")
    .WithDescription("Updates an existing book by ID")
    .Produces(StatusCodes.Status400BadRequest)
    .Produces<Book>(StatusCodes.Status204NoContent);

app.MapDelete("/api/books/{id:guid}", async (Guid id, BookContext db) =>
{
    var book = await db.Books.FindAsync(id);
    if (book == null) return Results.NoContent();
    db.Books.Remove(book);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).WithName("DeleteBook").WithTags("Books").WithDescription("Delete a book by ID");

app.MapGet("/api/books/stats", async (BookContext db) =>
{
    var genreToBooksCount = await db.Books.GroupBy(b => b.Genre).ToDictionaryAsync(g => g.Key, g => g.Count());
    return genreToBooksCount;
}).WithName("GetBooksStats").WithTags("Books").WithDescription("Get the count of books by genre").Produces<Dictionary<string, int>>();

// Ensure database and optionally seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BookContext>();
    await db.Database.EnsureCreatedAsync();

    var seedingEnabled = app.Configuration.GetValue("Seeding:Enabled", true);
    var seedCount = app.Configuration.GetValue("Seeding:Count", 100);

    if (seedingEnabled && !await db.Books.AnyAsync())
    {
        db.AddRange(Enumerable.Range(1, seedCount).Select(_ => Book.Generate()));
        await db.SaveChangesAsync();
    }
}

await app.RunAsync();