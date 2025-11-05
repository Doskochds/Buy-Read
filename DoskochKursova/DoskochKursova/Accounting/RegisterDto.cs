using System.ComponentModel.DataAnnotations;
namespace DoskochKursova.Accounting
{
    public class RegisterDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Login { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; }
    }
}
