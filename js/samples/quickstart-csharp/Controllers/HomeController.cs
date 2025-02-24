using System.Text;
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using QuickstartSampleWebApp.Models;
using Microsoft.Identity.Client;

namespace QuickstartSampleWebApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly string TenantId;     // Azure subscription TenantId
        private readonly string ClientId;     // Azure AD ApplicationId
        private readonly string ClientSecret; // Azure AD Application Service Principal password
        private readonly string Subdomain;    // Immersive Reader resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created with Azure CLI Powershell. Check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example, 'https://[SUBDOMAIN].cognitiveservices.azure.com/')
        private string Token;

        private IConfidentialClientApplication _confidentialClientApplication;
        private IConfidentialClientApplication ConfidentialClientApplication
        {
            get {
                if (_confidentialClientApplication == null) {
                    _confidentialClientApplication = ConfidentialClientApplicationBuilder.Create(ClientId)
                    .WithClientSecret(ClientSecret)
                    .WithAuthority($"https://login.windows.net/{TenantId}")
                    .Build();
                }

                return _confidentialClientApplication;
            }
        }

        public HomeController(Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            TenantId = configuration["TenantId"];
            ClientId = configuration["ClientId"];
            ClientSecret = configuration["ClientSecret"];
            Subdomain = configuration["Subdomain"];

            if (string.IsNullOrWhiteSpace(TenantId))
            {
                throw new ArgumentNullException("TenantId is null! Did you add that info to secrets.json?");
            }

            if (string.IsNullOrWhiteSpace(ClientId))
            {
                throw new ArgumentNullException("ClientId is null! Did you add that info to secrets.json?");
            }

            if (string.IsNullOrWhiteSpace(ClientSecret))
            {
                throw new ArgumentNullException("ClientSecret is null! Did you add that info to secrets.json?");
            }

            if (string.IsNullOrWhiteSpace(Subdomain))
            {
                throw new ArgumentNullException("Subdomain is null! Did you add that info to secrets.json?");
            }
        }

        /// <summary>
        /// Get an Azure AD authentication token
        /// </summary>
        private async Task GetTokenAsync()
        {
            const string resource = "https://cognitiveservices.azure.com/";

            var authResult = await ConfidentialClientApplication.AcquireTokenForClient(
                new[] { $"{resource}/.default" })
                .ExecuteAsync()
                .ConfigureAwait(false);

            Token = authResult.AccessToken;
        }

        public async Task<IActionResult> Index()
        {
            await GetTokenAsync();
            ViewData["Token"] = Token;
            ViewData["Subdomain"] = Subdomain;
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public async Task<IActionResult> Options()
        {
            await GetTokenAsync();
            ViewData["Token"] = Token;
            ViewData["Subdomain"] = Subdomain;
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
