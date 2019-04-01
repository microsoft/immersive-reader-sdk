using System.Threading.Tasks;

namespace AdvancedSampleWebApp.Pages
{
    public class UILangsModel : SampleModel
    {
        public async Task OnGet()
		{
			ViewData["Token"] = await GetTokenAsync(AzureSubscription.Region, AzureSubscription.SubscriptionKey);
		}
    }
}