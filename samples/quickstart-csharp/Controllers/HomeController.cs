// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace QuickstartSampleWebApp.Controllers
{
	public class HomeController : Controller
	{
		// Insert your Azure subscription key here
		public const string SubscriptionKey = "";

		// The location associated with the Immersive Reader resource.
		// The following are valid values for the region:
		//   eastus, westus, northeurope, westeurope, centralindia, japaneast, japanwest, australiaeast
		public const string Region = "";

		public IActionResult Index()
		{
			return View();
		}

		[Route("token")]
		public async Task<string> Token()
		{
			return await GetTokenAsync(Region, SubscriptionKey);
		}

		/// <summary>
		/// Exchange your Azure subscription key for an access token
		/// </summary>
		private async Task<string> GetTokenAsync(string region, string subscriptionKey)
		{
			if (string.IsNullOrEmpty(region) || string.IsNullOrEmpty(subscriptionKey))
			{
				throw new ArgumentNullException("Region or subscriptionKey is null!");
			}

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
