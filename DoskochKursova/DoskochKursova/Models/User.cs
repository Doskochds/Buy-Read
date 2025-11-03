using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;

namespace DoskochKursova.Models 
{
    public class User
    {
        // Primary Key (Id)
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; } 

      
        [Required]
        [StringLength(255)]
        public string Mail { get; set; } 

        [Required]
        [StringLength(50)]
        public string Login { get; set; } 

        [Required]
        [StringLength(255)]
        public string Password { get; set; } 

        [StringLength(255)]
        public string Avatar { get; set; } 

       
        [Required]
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow; 

        public DateTime? LastLoginDate { get; set; } 

       
        [StringLength(50)]
        public string Status { get; set; } = "Active"; 

        [StringLength(10)]
        public string Language { get; set; } = "uk"; 


        
        [ForeignKey("Role")]
        public int RoleId { get; set; } 
        public virtual ICollection<UserBook> UserBooks { get; set; }


        public virtual Role Role { get; set; }

    }
}