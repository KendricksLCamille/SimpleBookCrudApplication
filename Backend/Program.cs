using Backend;
using Backend.Endpoints;
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
var connectionString = builder.Configuration.GetConnectionString("Default");

builder.Services.AddDbContext<BookContext>(options => options.UseSqlite(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ConfiguredCorsPolicy", policy =>
    {
        if (allowedOrigins.Length == 0) return;
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
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

app.MapBooksApi();

// Apply migrations and optionally seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BookContext>();
    await db.Database.MigrateAsync();

    var seedingEnabled = app.Configuration.GetValue("Seeding:Enabled", true);
    var seedCount = app.Configuration.GetValue("Seeding:Count", 100);

    if (seedingEnabled && !await db.Books.AnyAsync())
    {
        db.AddRange(Enumerable.Range(1, seedCount).Select(_ => Book.Generate()));
        await db.SaveChangesAsync();
    }
}

await app.RunAsync();