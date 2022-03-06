// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace MultipleResourcesSampleWebApp.Controllers
{
    public class HomeController : Controller
    {
        // These should be the keys in the secrets.json file, explained in ReadMe.txt
        private readonly HashSet<string> ResourceKeys = new HashSet<string>() { "ImmersiveReaderResourceOne", "ImmersiveReaderResourceTwo" };
        // Map the resource key to the configuration object
        private readonly Dictionary<string, ImmersiveReaderResourceConfig> ResourceKeyToConfigs;

        IConfidentialClientApplication app;

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
            string tenantId = configuration[$"{resourceKey}:TenantId"];
            string clientId = configuration[$"{resourceKey}:ClientId"];
            string clientSecret = configuration[$"{resourceKey}:ClientSecret"];
            string subdomain = configuration[$"{resourceKey}:Subdomain"];

            if (string.IsNullOrWhiteSpace(tenantId))
            {
                throw new ArgumentNullException("TenantId is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }

            if (string.IsNullOrWhiteSpace(clientId))
            {
                throw new ArgumentNullException("ClientId is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }

            if (string.IsNullOrWhiteSpace(clientSecret))
            {
                throw new ArgumentNullException("ClientSecret is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }

            if (string.IsNullOrWhiteSpace(subdomain))
            {
                throw new ArgumentNullException("Subdomain is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }

            ResourceKeyToConfigs[resourceKey] = new ImmersiveReaderResourceConfig
            {
                TenantId = tenantId,
                ClientId = clientId,
                ClientSecret = clientSecret,
                Subdomain = subdomain
            };
        }

        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Get ImmersiveReaderLaunchParameters by using the resource that maps to the resource key
        /// </summary>
        /// <param name="resourceKey">The key for the resource in secrets.json</param>
        [Route("getLaunchParameters/{resourceKey}")]
        public async Task<JsonResult> GetLaunchParameters(string resourceKey)
        {
            if (ResourceKeyToConfigs.TryGetValue(resourceKey, out ImmersiveReaderResourceConfig resourceConfig))
            {
                try
                {
                    string token = await GetTokenAsync(resourceConfig);

                    ImmersiveReaderLaunchParameters launchParams = new ImmersiveReaderLaunchParameters
                    {
                        Token = token,
                        Subdomain = resourceConfig.Subdomain
                    };

                    return new JsonResult(launchParams);
                }
                catch
                {
                    return GetJsonResultError("Exception in getting token. Ensure that secrets.json is correct.", StatusCodes.Status500InternalServerError);
                }
            }
            else
            {
                return GetJsonResultError("Invalid resource key.", StatusCodes.Status400BadRequest);
            }
        }

        /// <summary>
        /// Get an Azure AD authentication token using a given resource
        /// </summary>
        private async Task<string> GetTokenAsync(ImmersiveReaderResourceConfig resourceConfig)
        {
            string authority = $"https://login.windows.net/{resourceConfig.TenantId}";
            const string resource = "https://cognitiveservices.azure.com/";

            if (app == null)
            {
                app = ConfidentialClientApplicationBuilder.Create(resourceConfig.ClientId)
                .WithClientSecret(resourceConfig.ClientSecret)
                .WithAuthority(authority)
                .Build();
            }

            var authResult = await app.AcquireTokenForClient(
                new[] { $"{resource}/.default" })
                .ExecuteAsync()
                .ConfigureAwait(false);

            return authResult.AccessToken;
        }

        private JsonResult GetJsonResultError(string message, int statusCode)
        {
            JsonResult result = new JsonResult(
                new
                {
                    Message = message
                }
            )
            {
                StatusCode = statusCode
            };

            return result;
        }
    }
}