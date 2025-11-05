using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration; 

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
            var message = new MailMessage();
            message.From = new MailAddress(fromMail);
            message.To.Add(new MailAddress(email));
            message.Subject = subject;
            message.Body = htmlMessage;
            message.IsBodyHtml = true;

            using (var smtpClient = new SmtpClient("smtp.gmail.com", 587))
            {
                smtpClient.Credentials = new NetworkCredential(fromMail, fromPassword);
                smtpClient.EnableSsl = true;

                await smtpClient.SendMailAsync(message);
            }
        }
    }
}