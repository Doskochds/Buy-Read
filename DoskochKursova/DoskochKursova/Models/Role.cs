using DoskochKursova.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoskochKursova.Models
{
    public class Role
    {
        
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } 

        [StringLength(255)]
        public string Description { get; set; }

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}