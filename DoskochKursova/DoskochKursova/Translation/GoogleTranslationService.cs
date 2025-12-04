using GTranslate.Translators;
using HtmlAgilityPack;
using System.Text;
using System.Net;

namespace DoskochKursova.Translation
{
    public class GoogleTranslationService : ITranslationService
    {
        private readonly GoogleTranslator _translator;
        private const int MAX_CHUNK_SIZE = 3500;
        private const string SEPARATOR = " [||] ";

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

                var textNodes = doc.DocumentNode.SelectNodes("//text()[normalize-space(.) != '']")
                                ?.Where(n => WebUtility.HtmlDecode(n.InnerText).Trim().Length > 1)
                                .ToList();

                if (textNodes == null || !textNodes.Any())
                    return htmlContent;

                var chunks = new List<List<HtmlNode>>();
                var currentChunk = new List<HtmlNode>();
                int currentLength = 0;

                foreach (var node in textNodes)
                {
                    int nodeLength = node.InnerText.Length;

                    if (currentLength + nodeLength + SEPARATOR.Length > MAX_CHUNK_SIZE)
                    {
                        chunks.Add(currentChunk);
                        currentChunk = new List<HtmlNode>();
                        currentLength = 0;
                    }

                    currentChunk.Add(node);
                    currentLength += nodeLength + SEPARATOR.Length;
                }
                if (currentChunk.Any()) chunks.Add(currentChunk);

                foreach (var chunk in chunks)
                {
                    var sb = new StringBuilder();
                    foreach (var node in chunk)
                    {
                        sb.Append(WebUtility.HtmlDecode(node.InnerText).Trim());
                        sb.Append(SEPARATOR);
                    }

                    string textToTranslate = sb.ToString();

                    // Видаляємо останній розділювач
                    if (textToTranslate.EndsWith(SEPARATOR))
                        textToTranslate = textToTranslate.Substring(0, textToTranslate.Length - SEPARATOR.Length);


                    await Task.Delay(1000);

                    var result = await _translator.TranslateAsync(textToTranslate, targetLanguage);

                    if (result != null)
                    {
                        string[] translatedParts = result.Translation.Split(new[] { SEPARATOR.Trim() }, StringSplitOptions.None);

                        for (int i = 0; i < chunk.Count && i < translatedParts.Length; i++)
                        {
                            chunk[i].InnerHtml = translatedParts[i].Trim();
                        }
                    }
                }

                return doc.DocumentNode.OuterHtml;
            }
            catch (Exception ex)
            {
                return $"<div style='background-color:#ffebee; color:#c62828; padding:10px; border:1px solid #ef9a9a;'>Blocked by Google or Error: {ex.Message}</div>" + htmlContent;
            }
        }
    }
}