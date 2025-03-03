// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using System.Text;
using Newtonsoft.Json;

namespace MultipleResourcesSampleWebApp.Controllers
{
    public class HomeController : Controller
    {
        // These should be the keys in the secrets.json file, explained in ReadMe.txt
        private readonly HashSet<string> ResourceKeys = new HashSet<string>() { "ImmersiveReaderResourceOne", "ImmersiveReaderResourceTwo" };
        // Map the resource key to the configuration object
        private readonly Dictionary<string, ImmersiveReaderResourceConfig> ResourceKeyToConfigs;

        private string TenantId;     // Azure subscription TenantId
        private string ClientId;     // Azure AD ApplicationId
        private string ClientSecret; // Azure AD Application Service Principal password
        private string Subdomain;    // Immersive Reader resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created with Azure CLI Powershell. Check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example, 'https://[SUBDOMAIN].cognitiveservices.azure.com/')
        private string Token;

        public HomeController(IConfiguration configuration)
        {
            ResourceKeyToConfigs = new Dictionary<string, ImmersiveReaderResourceConfig>(StringComparer.OrdinalIgnoreCase);

            // Initialize all of our resources
            foreach (string key in ResourceKeys)
            {
                InitializeResource(configuration, key);
            }
        }

        /// <summary>
        /// Create an ImmersiveReaderResourceConfig for the resourceKey supplied, and map the key to the ImmersiveReaderResourceConfig object.
        /// </summary>
        private void InitializeResource(IConfiguration configuration, string resourceKey)
        {
            TenantId = configuration[$"{resourceKey}:TenantId"];
            ClientId = configuration[$"{resourceKey}:ClientId"];
            ClientSecret = configuration[$"{resourceKey}:ClientSecret"];
            Subdomain = configuration[$"{resourceKey}:Subdomain"];

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

            ResourceKeyToConfigs[resourceKey] = new ImmersiveReaderResourceConfig
            {
                TenantId = TenantId,
                ClientId = ClientId,
                ClientSecret = ClientSecret,
                Subdomain = Subdomain
            };
        }

        public async Task<IActionResult> Index()
        {
            Dictionary<string, object> tokens = new Dictionary<string, object>();

            foreach (var key in ResourceKeys)
            {
                if (ResourceKeyToConfigs.TryGetValue(key, out var resourceConfig))
                {
                    await GetTokenAsync(resourceConfig);
                    tokens[key] = new
                    {
                        Token = Token,
                        Subdomain = resourceConfig.Subdomain
                    };
                }
            }

            TempData["ImmersiveReaderTokens"] = JsonConvert.SerializeObject(tokens);
            return View();
        }

        /// <summary>
        /// Get an Azure AD authentication token using a given resource
        /// </summary>
        private async Task GetTokenAsync(ImmersiveReaderResourceConfig resourceConfig)
        {
            const string resource = "https://cognitiveservices.azure.com/";

            var confidentialClient = ConfidentialClientApplicationBuilder.Create(resourceConfig.ClientId)
                .WithClientSecret(resourceConfig.ClientSecret)
                .WithAuthority($"https://login.windows.net/{resourceConfig.TenantId}")
                .Build();

            var authResult = await confidentialClient.AcquireTokenForClient(new[] { $"{resource}/.default" })
                .ExecuteAsync()
                .ConfigureAwait(false);

            Token = authResult.AccessToken;
        }
    }
}
