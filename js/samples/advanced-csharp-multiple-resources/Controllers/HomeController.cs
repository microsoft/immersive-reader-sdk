// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using System.Text;

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
                        Token = EncryptToken(token),
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
            const string resource = "https://cognitiveservices.azure.com/";

            var authResult = await ConfidentialClientApplication.AcquireTokenForClient(
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

        private string EncryptToken(string token)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(token));
        }
    }
}