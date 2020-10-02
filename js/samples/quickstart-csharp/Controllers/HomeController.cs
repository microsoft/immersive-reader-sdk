using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using QuickstartSampleWebApp.Models;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace QuickstartSampleWebApp.Controllers
{
	public class HomeController : Controller
	{
		private readonly string TenantId;     // Azure subscription TenantId
		private readonly string ClientId;     // Azure AD ApplicationId
		private readonly string ClientSecret; // Azure AD Application Service Principal password
		private readonly string Subdomain;    // Immersive Reader resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created with Azure CLI Powershell. Check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example, 'https://[SUBDOMAIN].cognitiveservices.azure.com/')

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
		private async Task<string> GetTokenAsync()
		{
			string authority = $"https://login.windows.net/{TenantId}";
			const string resource = "https://cognitiveservices.azure.com/";

			AuthenticationContext authContext = new AuthenticationContext(authority);
			ClientCredential clientCredential = new ClientCredential(ClientId, ClientSecret);

			AuthenticationResult authResult = await authContext.AcquireTokenAsync(resource, clientCredential);

			return authResult.AccessToken;
		}

		[HttpGet]
		public async Task<JsonResult> GetTokenAndSubdomain()
		{
			try
			{
				string tokenResult = await GetTokenAsync();

				return new JsonResult(new { token = tokenResult, subdomain = Subdomain });
			}
			catch (Exception e)
			{
				string message = "Unable to acquire Azure AD token. Check the debugger for more information.";
				Debug.WriteLine(message, e);
				return new JsonResult(new { error = message });
			}
		}

		public IActionResult Index()
		{
			return View();
		}

		public IActionResult About()
		{
			ViewData["Message"] = "Your application description page.";

			return View();
		}

		public IActionResult Contact()
		{
			ViewData["Message"] = "Your contact page.";

			return View();
		}

		public IActionResult Privacy()
		{
			return View();
		}

		[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		public IActionResult Error()
		{
			return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
		}
	}
}
