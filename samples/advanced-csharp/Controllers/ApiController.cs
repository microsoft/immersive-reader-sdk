using System;
using System.IO;
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