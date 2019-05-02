using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AdvancedSampleWebApp.Pages
{
    [Route("api")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        [Route("token")]
        public async Task<string> Token()
        {
            return await GetTokenAsync(AzureSubscription.Region, AzureSubscription.SubscriptionKey);
        }

        protected async Task<string> GetTokenAsync(string region, string subscriptionKey)
        {
            if (string.IsNullOrEmpty(region) || string.IsNullOrEmpty(subscriptionKey))
            {
                throw new ArgumentNullException("Region or subscriptionKey is null! Did you update AzureSubscription.cs?");
            }

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", subscriptionKey);
                using (var response = await client.PostAsync($"https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken", null))
                {
                    return await response.Content.ReadAsStringAsync();
                }
            }
        }
    }
}