using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Accounting
{
    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string NewPassword { get; set; }
    }
}
