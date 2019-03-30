using System.Threading.Tasks;

namespace AdvancedSampleWebApp.Pages
{
	public class IndexModel : SampleModel
	{ 
		public async Task OnGet()
		{
			ViewData["Token"] = await GetTokenAsync(AzureSubscription.Region, AzureSubscription.SubscriptionKey);
		}
	}
}
