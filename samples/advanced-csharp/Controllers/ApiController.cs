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
        private readonly string SubscriptionKey;
        private readonly string Endpoint;

        public ApiController(Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            SubscriptionKey = configuration["SubscriptionKey"];
            Endpoint = configuration["Endpoint"];

            if (string.IsNullOrEmpty(Endpoint))
            {
                throw new ArgumentNullException("Endpoint is null! Did you add that info to secrets.json?");
            }

            if (string.IsNullOrEmpty(SubscriptionKey))
            {
                throw new ArgumentNullException("SubscriptionKey is null! Did you add that info to secrets.json?");
            }
        }

        [Route("token")]
        public async Task<string> Token()
        {
            return await GetTokenAsync();
        }

        protected async Task<string> GetTokenAsync()
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", SubscriptionKey);
                using (var response = await client.PostAsync($"{Endpoint}/issueToken", null))
                {
                    return await response.Content.ReadAsStringAsync();
                }
            }
        }
    }
}