using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Backend;

internal record Book(Guid Id, string Title, string Author, string Genre, DateTime PublishedDate, int Rating)
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
    public DateTime PublishedDate { get; init; } = PublishedDate;

    [Required]
    [Range(1,5, ErrorMessage="Rating must be between 1 and 5")]
    public int Rating { get; init; } = Rating;

    public static Book Generate()
    {
        return new Book(Guid.NewGuid(), RandomString(),RandomString(), RandomString(), DateTime.Now, Random.Shared.Next(1,6));

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
}