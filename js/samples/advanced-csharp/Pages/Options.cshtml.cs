using Microsoft.Extensions.Configuration;

namespace AdvancedSampleWebApp.Pages
{
    public class OptionsModel : SamplePageModel
    {
        public OptionsModel(IConfiguration configuration) : base(configuration)
        { }
    }
}
