using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Backend;

internal record Book(Guid Id, string Title, string Author, string Genre, DateOnly PublishedDate, int Rating)
{
    [Key]
    public Guid Id { get; set; } = Id;

    [Required]
    [MaxLength(100)]
    [MinLength(1)]
    public string Title { get; init; } = Title;

    [Required]
    [MaxLength(50)]
    [MinLength(1)]
    public string Author { get; init; } = Author;

    [Required]
    [MaxLength(50)]
    public string Genre { get; init; } = Genre;

    [Required]
    public DateOnly PublishedDate { get; init; } = PublishedDate;

    [Required]
    [Range(1,5, ErrorMessage="Rating must be between 1 and 5")]
    public int Rating { get; init; } = Rating;

    public static Book Generate()
    {
        // Genre parameter has it's content length set to one to make sure there are more duplicate genres
        return new Book(Guid.NewGuid(), RandomString(),RandomString(), RandomString(1), RandomDate(), Random.Shared.Next(1,6));

        DateOnly RandomDate()
        {
            var year = Random.Shared.Next(1900, DateTime.Now.Year);
            var month = Random.Shared.Next(1, 13);
            var day = Random.Shared.Next(1, DateTime.DaysInMonth(year, month));
            return new DateOnly(year, month, day);
        }

        string RandomString(int length = 2)
        {
            var random = new Random();
            var builder = new StringBuilder(length);
            for (var i = 0; i < length; i++)
            {
                var character = random.Next(65, 90) == 65? (char)random.Next(97, 122) : (char)random.Next(48, 57);
                builder.Append(character);
            }
            return builder.ToString();
        }
    }

    public bool IsNotValidBook(out IResult? result)
    {
        // Validate the book object
        var validationResults = new List<ValidationResult>();
        var context = new ValidationContext(this);
        var isValid = Validator.TryValidateObject(this, context, validationResults, true);

        if (isValid)
        {
            result = null;
            return false;
        }
        result = Results.BadRequest(validationResults);
        return true;
    }
}