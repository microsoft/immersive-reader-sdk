using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.Identity.Client;

namespace AdvancedSampleWebApp.Pages
{
    [Route("api")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        private readonly string TenantId;     // Azure subscription TenantId
        private readonly string ClientId;     // Azure AD ApplicationId
        private readonly string ClientSecret; // Azure AD Application Service Principal password
        private readonly string Subdomain;    // Immersive Reader resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created with Azure CLI Powershell. Check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example, 'https://[SUBDOMAIN].cognitiveservices.azure.com/')

        private IConfidentialClientApplication _confidentialClientApplication;
        private IConfidentialClientApplication ConfidentialClientApplication
        {
            get
            {
                if (_confidentialClientApplication == null)
                {
                    _confidentialClientApplication = ConfidentialClientApplicationBuilder.Create(ClientId)
                    .WithClientSecret(ClientSecret)
                    .WithAuthority($"https://login.windows.net/{TenantId}")
                    .Build();
                }

                return _confidentialClientApplication;
            }
        }

        public ApiController(Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            TenantId = configuration["TenantId"];
            ClientId = configuration["ClientId"];
            ClientSecret = configuration["ClientSecret"];
            Subdomain = configuration["Subdomain"];

            if (string.IsNullOrWhiteSpace(TenantId))
            {
                throw new ArgumentNullException("TenantId is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }

            if (string.IsNullOrWhiteSpace(ClientId))
            {
                throw new ArgumentNullException("ClientId is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }

            if (string.IsNullOrWhiteSpace(ClientSecret))
            {
                throw new ArgumentNullException("ClientSecret is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }

            if (string.IsNullOrWhiteSpace(Subdomain))
            {
                throw new ArgumentNullException("Subdomain is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }
        }

        [Route("subdomain")]
        public string GetSubdomain()
        {
            return Subdomain;
        }

        [Route("token")]
        [HttpPost]
        [Consumes("text/plain")]
        [Produces("text/plain")]
        public async Task<string> Token()
        {
            try
            {
                // Retrieve the canary value and authenticate
                string canary;
                using (StreamReader reader = new StreamReader(Request.Body))
                {
                    canary = await reader.ReadToEndAsync();
                }

                if (string.IsNullOrEmpty(canary))
                {
                    throw new Exception("Canary missing");
                }

                if (!Canary.Validate(canary))
                {
                    throw new Exception("Authentication failed");
                }

                return await GetTokenAsync();
            }
            catch (Exception e)
            {
                string message = "Unable to acquire token and subdomain. Check the console for more information.";
                Debug.WriteLine(message, e);
                return message;
            }
        }

        /// <summary>
        /// Get an Azure AD authentication token
        /// </summary>
        public async Task<string> GetTokenAsync()
        {
            const string resource = "https://cognitiveservices.azure.com/";

            var authResult = await ConfidentialClientApplication.AcquireTokenForClient(
                new[] { $"{resource}/.default" })
                .ExecuteAsync()
                .ConfigureAwait(false);

            return authResult.AccessToken;
        }
    }
}