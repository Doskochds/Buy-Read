using Microsoft.AspNetCore.Identity; 
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DoskochKursova.Accounting
{
   
    public class Role : IdentityRole<int>
 
    {
        
        [StringLength(255)]
        public string? Description { get; set; }
    }
}