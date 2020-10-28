using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System;
using System.IO;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;

// The User Control item template is documented at https://go.microsoft.com/fwlink/?LinkId=234236

namespace ImmersiveReader
{
    public sealed partial class ImmersiveReaderView : UserControl
    {
        private string _script;

        public ImmersiveReaderView()
        {
            this.InitializeComponent();
        }

        public string SubscriptionKey
        {
            get => (string)GetValue(SubscriptionKeyProperty);
            set => SetValue(SubscriptionKeyProperty, value);
        }

        private static DependencyProperty SubscriptionKeyProperty = DependencyProperty.Register(
            "SubscriptionKey",
            typeof(string),
            typeof(ImmersiveReaderView),
            null);

        public string Region
        {
            get => (string)GetValue(RegionProperty);
            set => SetValue(RegionProperty, value);
        }

        private static DependencyProperty RegionProperty = DependencyProperty.Register(
            "Region",
            typeof(string),
            typeof(ImmersiveReaderView),
            null);

        public IAsyncAction Start(string title, string content)
        {
            return StartAsync(title, content).AsAsyncAction();
        }

        private async Task StartAsync(string title, string content)
        {
            if (string.IsNullOrWhiteSpace(_script))
            {
                var assembly = this.GetType().GetTypeInfo().Assembly;
                using (Stream scriptStream = assembly.GetManifestResourceStream("ImmersiveReader.script.html"))
                {
                    if (scriptStream == null)
                    {
                        throw new Exception($"Error loading the immersive reader script from assembly. " +
                            $"Please contact SDK owners for more help.");
                    }

                    using (var reader = new StreamReader(scriptStream))
                    {
                        _script = await reader.ReadToEndAsync();
                    }
                }
            }

            string text = _script;
            var token = await GetTokenAsync();

            text = text.Replace("|TITLE|", title);
            text = text.Replace("|TOKEN|", token);
            text = text.Replace("|CONTENT|", content.Replace("'", "\\\'"));
            MainWebView.NavigateToString(text);
        }

        private async Task<string> GetTokenAsync()
        {
            ValidateAuthStrings();

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", SubscriptionKey);
                using (var response = await client.PostAsync($"https://{Region}.api.cognitive.microsoft.com/sts/v1.0/issueToken", null))
                {
                    string token = await response.Content.ReadAsStringAsync();
                    return token.Replace("\"", "");
                }
            }
        }

        private void ValidateAuthStrings()
        {
            if (string.IsNullOrWhiteSpace(SubscriptionKey))
            {
                throw new ArgumentNullException("SubScriptionKey");
            }
            else if (string.IsNullOrWhiteSpace(Region))
            {
                throw new ArgumentNullException("Region");
            }
        }
    }
}
