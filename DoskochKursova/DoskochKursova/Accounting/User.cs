using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using DoskochKursova.Books;

namespace DoskochKursova.Accounting
{

    public class User : IdentityUser<int>
    {
        
        [StringLength(255)]
        public string? Avatar { get; set; }

        [Required]
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginDate { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "Active";

        [StringLength(10)]
        public string Language { get; set; } = "uk";
        
        public virtual ICollection<UserBook> UserBooks { get; set; } = new List<UserBook>();
    }
}