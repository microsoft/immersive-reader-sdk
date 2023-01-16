using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace SampleApp
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            options.Add(new KeyValuePair<string, bool>("disableGrammar", false));
            options.Add(new KeyValuePair<string, bool>("disableTranslation", false));
            options.Add(new KeyValuePair<string, bool>("disableLanguageDetection", false));

            this.InitializeComponent();
        }

        private List<KeyValuePair<string, bool>> options = new List<KeyValuePair<string, bool>>();

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            immersiveReader.TenantId = TenantId.Text;
            immersiveReader.ClientId = ClientId.Text;
            immersiveReader.ClientSecret = ClientSecret.Password;
            immersiveReader.Subdomain = Subdomain.Text;
            await immersiveReader.Start("Title", ReaderContent.Text, options, Language.Text);
        }

        private void RadioButtonOnSelectionHandler(object sender, RoutedEventArgs e)
        {
            OptionSelectionHandler(sender, true);
        }

        private void RadioButtonOnDeselectionHandler(object sender, RoutedEventArgs e)
        {
            OptionSelectionHandler(sender, false);
        }

        private void OptionSelectionHandler(object sender, bool selected) {
            var currentOption = ((RadioButton)sender).Name;
            foreach (var option in options)
            {
                if (option.Key == currentOption)
                {
                    options.Remove(option);
                    options.Add(new KeyValuePair<string, bool>(option.Key, selected));
                    break;
                }
            }

            Language.IsEnabled = (currentOption == "disableLanguageDetection" && selected);
            Language.Text = (currentOption == "disableLanguageDetection" && selected) ? Language.Text : "en";
        }
    }
}
