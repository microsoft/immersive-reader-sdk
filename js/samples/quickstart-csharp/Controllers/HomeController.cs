using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using QuickstartSampleWebApp.Models;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System.Net.Http;

namespace QuickstartSampleWebApp.Controllers
{
	public class HomeController : Controller
	{
		// Insert your Azure subscription key here
		public string SubscriptionKey = "";

		// The location associated with the Immersive Reader resource.
		// The following are valid values for the region:
		//   eastus, westus, northeurope, westeurope, centralindia, japaneast, australiaeast
		public string Region = "";

		public HomeController(Microsoft.Extensions.Configuration.IConfiguration configuration)
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

		[HttpGet]
		public async Task<string> GetToken()
		{
			using (var client = new HttpClient())
			{
				client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", SubscriptionKey);
				using (var response = await client.PostAsync($"https://{Region}.api.cognitive.microsoft.com/sts/v1.0/issueToken", null))
				{
					string token = await response.Content.ReadAsStringAsync();
					return token.Replace("\"", "");
				}
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
