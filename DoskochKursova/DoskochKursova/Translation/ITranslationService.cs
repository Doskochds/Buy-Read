using System.Threading.Tasks;

namespace DoskochKursova.Translation
{
    public interface ITranslationService
    {
        Task<string> TranslateAsync(string text, string targetLanguage);
    }
}