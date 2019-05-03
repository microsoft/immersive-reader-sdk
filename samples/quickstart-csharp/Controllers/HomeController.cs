// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace QuickstartSampleWebApp.Controllers
{
	public class HomeController : Controller
	{
		private readonly string SubscriptionKey;
		private readonly string Endpoint;

		public HomeController(Microsoft.Extensions.Configuration.IConfiguration configuration)
		{
			SubscriptionKey = configuration["SubscriptionKey"];
			Endpoint = configuration["Endpoint"];

			if (string.IsNullOrEmpty(Endpoint) || string.IsNullOrEmpty(SubscriptionKey))
			{
				throw new ArgumentNullException("Endpoint or subscriptionKey is null!");
			}
		}

		public IActionResult Index()
		{
			return View();
		}

		[Route("token")]
		public async Task<string> Token()
		{
			return await GetTokenAsync();
		}

		/// <summary>
		/// Exchange your Azure subscription key for an access token
		/// </summary>
		private async Task<string> GetTokenAsync()
		{
			using (var client = new System.Net.Http.HttpClient())
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