using GTranslate.Translators;
using HtmlAgilityPack;
using System.Text;
using DoskochKursova.Translation;

namespace DoskochKursova.Translation
{
    public class GoogleTranslationService : ITranslationService
    {
        private readonly GoogleTranslator _translator;

        public GoogleTranslationService()
        {
            _translator = new GoogleTranslator();
        }

        public async Task<string> TranslateAsync(string htmlContent, string targetLanguage)
        {
            if (string.IsNullOrWhiteSpace(htmlContent)) return "";
            if (targetLanguage == "uk") return htmlContent;

            try
            {
                var doc = new HtmlDocument();
                doc.LoadHtml(htmlContent);
                var textNodes = doc.DocumentNode.SelectNodes("//text()[normalize-space(.) != '']");

                if (textNodes != null)
                {
                    foreach (var node in textNodes)
                    {
                        string originalText = System.Net.WebUtility.HtmlDecode(node.InnerText).Trim();

                        if (originalText.Length < 2) continue;

                        await Task.Delay(150);

                        var result = await _translator.TranslateAsync(originalText, targetLanguage);

                        if (result != null)
                        {
                            node.InnerHtml = result.Translation;
                        }
                    }
                }

                
                return doc.DocumentNode.OuterHtml;
            }
            catch (Exception ex)
            {
                return $"<div style='color:red; padding:10px; border:1px solid red; margin-bottom:10px;'>Помилка перекладу: {ex.Message}</div>" + htmlContent;
            }
        }
    }
}