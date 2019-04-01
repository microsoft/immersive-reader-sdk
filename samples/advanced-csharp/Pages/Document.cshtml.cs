using System.Threading.Tasks;

namespace AdvancedSampleWebApp.Pages
{
    public class DocumentModel : SampleModel
    {
        public async Task OnGet()
        {
			ViewData["Token"] = await GetTokenAsync(AzureSubscription.Region, AzureSubscription.SubscriptionKey);
		}
    }
}