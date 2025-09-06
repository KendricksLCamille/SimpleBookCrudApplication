using System.Diagnostics;
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Backend
{
    // Test Ideas generate using AI but modifications were made to remove cruft
    public class ProgramTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public ProgramTests()
        {
            var factory = new WebApplicationFactory<Program>();
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetAllBooks_ReturnsAllBooks()
        {
            // Arrange
            var response = await _client.GetAsync("/api/books");

            // Act
            response.EnsureSuccessStatusCode();
            var books = await response.Content.ReadFromJsonAsync<List<Book>>();

            // Assert
            Assert.NotNull(books);
            Assert.True(books.Count > 0);
        }

        [Fact]
        public async Task GetBook_ReturnsNotFound_ForNonExistentId()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();
            var response = await _client.GetAsync($"/api/books/{nonExistentId}");

            // Act
            var statusCode = response.StatusCode;

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, statusCode);
        }

        [Fact]
        public async Task GetBook_ReturnsOkWithCorrectBook_ForValidId()
        {
            // Arrange
            var response = await _client.GetAsync("/api/books");
            response.EnsureSuccessStatusCode();
            var books = await response.Content.ReadFromJsonAsync<List<Book>>();
            Debug.Assert(books != null, nameof(books) + " != null");
            var existingBook = books[0];

            // Act
            var bookResponse = await _client.GetAsync($"/api/books/{existingBook.Id}");

            // Assert
            bookResponse.EnsureSuccessStatusCode();
            var returnedBook = await bookResponse.Content.ReadFromJsonAsync<Book>();
            Assert.NotNull(returnedBook);
            Assert.Equal(existingBook.Id, returnedBook.Id);
            Assert.Equal(existingBook.Title, returnedBook.Title);
            Assert.Equal(existingBook.Author, returnedBook.Author);
            Assert.Equal(existingBook.Genre, returnedBook.Genre);
        }

        [Fact]
        public async Task AddBook_ReturnsBadRequest_ForInvalidBookData()
        {
            // Arrange
            var invalidBook = Book.Generate() with { Rating = 15 };

            // Act
            var response = await _client.PostAsJsonAsync("/api/books", invalidBook);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("Rating must be between 1 and 5", content);
        }

        [Fact]
        public async Task AddBook_ReturnsCreatedWithNewBookId_ForValidBookData()
        {
            // Arrange
            var validBook = Book.Generate();

            // Act
            var response = await _client.PostAsJsonAsync("/api/books", validBook);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var createdBook = await response.Content.ReadFromJsonAsync<Book>();
            Assert.NotNull(createdBook);
            Assert.NotEqual(Guid.Empty, createdBook.Id);
            Assert.Equal(validBook.Title, createdBook.Title);
            Assert.Equal(validBook.Author, createdBook.Author);
            Assert.Equal(validBook.Genre, createdBook.Genre);
            Assert.Equal($"/api/books/{createdBook.Id}", response.Headers.Location?.ToString());
        }

        [Fact]
        public async Task UpdateBook_ReturnsBadRequest_ForInvalidBookData()
        {
            // Arrange
            var existingBookResponse = await _client.GetAsync("/api/books");
            existingBookResponse.EnsureSuccessStatusCode();
            var existingBooks = await existingBookResponse.Content.ReadFromJsonAsync<List<Book>>();
            Debug.Assert(existingBooks!= null, nameof(existingBooks) + "!= null");
            var existingBook = existingBooks[0];

            var invalidBook = Book.Generate() with { Rating = 15, Id = existingBook.Id, Title = string.Empty };

            // Act
            var response = await _client.PutAsJsonAsync($"/api/books/{existingBook.Id}", invalidBook);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("The Title field is required", content);
        }

        [Fact]
        public async Task UpdateBook_ReturnsNoContent_ForSuccessfulUpdate()
        {
            // Arrange
            var existingBookResponse = await _client.GetAsync("/api/books");
            existingBookResponse.EnsureSuccessStatusCode();
            var existingBooks = await existingBookResponse.Content.ReadFromJsonAsync<List<Book>>();
            Debug.Assert(existingBooks!= null, nameof(existingBooks) + "!= null");
            var existingBook = existingBooks[0];

            var updatedBook = Book.Generate();

            // Act
            var response = await _client.PutAsJsonAsync($"/api/books/{existingBook.Id}", updatedBook);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the book was actually updated
            var getUpdatedBookResponse = await _client.GetAsync($"/api/books/{existingBook.Id}");
            getUpdatedBookResponse.EnsureSuccessStatusCode();
            var updatedBookFromServer = await getUpdatedBookResponse.Content.ReadFromJsonAsync<Book>();
            Assert.NotNull(updatedBookFromServer);
            Assert.Equal(updatedBook.Title, updatedBookFromServer.Title);
            Assert.Equal(updatedBook.Author, updatedBookFromServer.Author);
            Assert.Equal(updatedBook.Genre, updatedBookFromServer.Genre);
        }

        [Fact]
        public async Task DeleteBook_RemovesExistingBook_ReturnsNoContent()
        {
            // Arrange
            var response = await _client.GetAsync("/api/books");
            response.EnsureSuccessStatusCode();
            var books = await response.Content.ReadFromJsonAsync<List<Book>>();
            Debug.Assert(books!= null, nameof(books) + "!= null");
            var existingBook = books[0];

            // Act
            var deleteResponse = await _client.DeleteAsync($"/api/books/{existingBook.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

            // Verify the book is deleted
            var getResponse = await _client.GetAsync($"/api/books/{existingBook.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task DeleteBook_DoesNotThrowError_ForNonExistentBook()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var response = await _client.DeleteAsync($"/api/books/{nonExistentId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task GetBooksStatus_ReturnsCorrectCountOfBooksByGenre()
        {
            // Arrange
            var response = await _client.GetAsync("/api/books/status");

            // Act
            response.EnsureSuccessStatusCode();
            var genreCounts = await response.Content.ReadFromJsonAsync<Dictionary<string, int>>();

            // Assert
            Assert.NotNull(genreCounts);
            Assert.True(genreCounts.Count > 0);

            // Verify the counts by fetching all books and comparing
            var allBooksResponse = await _client.GetAsync("/api/books");
            allBooksResponse.EnsureSuccessStatusCode();
            var allBooks = await allBooksResponse.Content.ReadFromJsonAsync<List<Book>>();

            Assert.NotNull(allBooks);
            var expectedGenreCounts = allBooks.GroupBy(b => b.Genre).ToDictionary(g => g.Key, g => g.Count());

            Assert.Equal(expectedGenreCounts.Count, genreCounts.Count);
            foreach (var (genre, count) in expectedGenreCounts)
            {
                Assert.True(genreCounts.ContainsKey(genre));
                Assert.Equal(count, genreCounts[genre]);
            }
        }
    }
}
