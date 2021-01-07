using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace AdvancedSampleWebApp.Pages
{
    [Route("api")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        // Azure AD Application Service key
        private readonly string SubscriptionKey;

        // The location associated with the Immersive Reader resource.
		// The following are valid values for the region:
		// eastus, westus, northeurope, westeurope, centralindia, japaneast, australiaeast
        private readonly string Region;

        public ApiController(Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            SubscriptionKey = configuration["SubscriptionKey"];
            Region = configuration["Region"];

            if (string.IsNullOrWhiteSpace(SubscriptionKey))
			{
				throw new ArgumentNullException("SubscriptionKey is null! Did you add that info to secrets.json?");
			}

			if (string.IsNullOrWhiteSpace(Region))
			{
				throw new ArgumentNullException("Region is null! Did you add that info to secrets.json?");
			}
        }

        [Route("token")]
        [HttpPost]
        [Consumes("text/plain")]
        [Produces("text/plain")]
        public async Task<string> Token()
        {
            // Retrieve the canary value and authenticate
            string canary;
            using (StreamReader reader = new StreamReader(Request.Body))
            {
                canary = reader.ReadToEnd();
            }

            if (string.IsNullOrEmpty(canary))
            {
                throw new Exception("Canary missing");
            }

            if (!Canary.Validate(canary))
            {
                throw new Exception("Authentication failed");
            }

            // Obtain a token using the subscription key
            return await GetTokenAsync(Region, SubscriptionKey);
        }

        protected async Task<string> GetTokenAsync(string region, string subscriptionKey)
        {
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