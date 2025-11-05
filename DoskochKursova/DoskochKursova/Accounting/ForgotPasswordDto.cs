using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Accounting
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
