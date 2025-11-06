using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;


namespace DoskochKursova.Accounting
{
    public class EmailSender : IEmailSender
    {
        private readonly IConfiguration _config;

        public EmailSender(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var fromMail = _config["MailSettings:FromMail"];
            var fromPassword = _config["MailSettings:FromPassword"];
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Buy&Read", fromMail));
            message.To.Add(new MailboxAddress(email, email));
            message.Subject = subject;
            message.Body = new TextPart(TextFormat.Html) { Text = htmlMessage };

            
            using (var client = new SmtpClient())
            {
                
                await client.ConnectAsync("smtp.gmail.com", 465, SecureSocketOptions.SslOnConnect);
                await client.AuthenticateAsync(fromMail, fromPassword);                
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
        }
    }
}