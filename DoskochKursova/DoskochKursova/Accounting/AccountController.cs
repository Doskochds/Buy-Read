using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using DoskochKursova.Accounting;
using DoskochKursova.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System;
using System.Collections.Generic;

namespace DoskochKursova.Accounting
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleManager<Role> _roleManager; 
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _config;

        public AccountController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            RoleManager<Role> roleManager, 
            IEmailSender emailSender,
            IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _emailSender = emailSender;
            _config = config;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await _userManager.FindByNameAsync(model.Login) != null)
                return BadRequest(new { Message = "Цей логін вже зайнятий." });

            if (await _userManager.FindByEmailAsync(model.Email) != null)
                return BadRequest(new { Message = "Ця пошта вже зареєстрована." });

            var user = new User
            {
                UserName = model.Login,
                Email = model.Email,
                RegistrationDate = DateTime.UtcNow,
                Status = "Active",
                Language = "uk"
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            if (!await _roleManager.RoleExistsAsync("User"))
                await _roleManager.CreateAsync(new Role { Name = "User", Description = "Користувач" });

            if (!await _roleManager.RoleExistsAsync("Admin"))
                await _roleManager.CreateAsync(new Role { Name = "Admin", Description = "Адміністратор" });

            await _userManager.AddToRoleAsync(user, "User");
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var frontendUrl = _config["ClientUrl"] ?? "http://localhost:5173";
            var callbackUrl = $"{frontendUrl}/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

            await _emailSender.SendEmailAsync(
                model.Email,
                "Підтвердіть ваш акаунт - Buy&Read",
                $"Будь ласка, підтвердіть реєстрацію, клікнувши на посилання: <a href='{callbackUrl}'>Підтвердити</a>");

            return Ok(new { Message = "Реєстрація успішна. Будь ласка, перевірте пошту для підтвердження акаунта." });
        }

        [HttpGet("confirmEmail")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail([FromQuery] int userId, [FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token) || userId == 0)
                return BadRequest("Неправильні параметри для підтвердження.");

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return NotFound("Користувача не знайдено.");

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Пошту успішно підтверджено!" });
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.FindByNameAsync(model.Login);
            if (user == null)
                return Unauthorized(new { Message = "Неправильний логін або пароль." });

            if (!await _userManager.IsEmailConfirmedAsync(user))
                return Unauthorized(new { Message = "Ви не підтвердили свою електронну пошту." });

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
                return Unauthorized(new { Message = "Неправильний логін або пароль." });

            user.LastLoginDate = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var tokenString = await GenerateJwtToken(user);

            return Ok(new { token = tokenString, message = "Вхід успішний." });
        }

        [HttpPost("forgotPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
            {

                return Ok(new { Message = "Якщо ваш email зареєстровано, ви отримаєте лист для скидання пароля." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var frontendUrl = _config["ClientUrl"] ?? "http://localhost:5173";
            var callbackUrl = $"{frontendUrl}/reset-password?email={user.Email}&token={Uri.EscapeDataString(token)}";

            await _emailSender.SendEmailAsync(
                model.Email,
                "Скидання пароля - Buy&Read",
                $"Для скидання пароля, перейдіть за посиланням: <a href='{callbackUrl}'>Скинути пароль</a>");

            return Ok(new { Message = "Якщо ваш email зареєстровано, ви отримаєте лист для скидання пароля." });
        }

        [HttpPost("resetPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { Message = "Помилка скидання пароля." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Пароль успішно скинуто." });
            }

            return BadRequest(result.Errors);
        }

        private async Task<string> GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(7);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}