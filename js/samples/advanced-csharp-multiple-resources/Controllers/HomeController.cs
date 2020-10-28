// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using MultipleResourcesSampleWebApp;
using Newtonsoft.Json;

namespace QuickstartSampleWebApp.Controllers
{
    public class HomeController : Controller
	{
		// These should be the keys in the secrets.json file, explained in ReadMe.txt
		private readonly HashSet<string> ResourceKeys = new HashSet<string>() { "ImmersiveReaderResourceOne", "ImmersiveReaderResourceTwo" };
		// Map the resource key to the configuration object
		private readonly Dictionary<string, ImmersiveReaderResourceConfig> ResourceKeyToConfigs;
		
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
			string subscriptionKey = configuration[$"{resourceKey}:SubscriptionKey"];
			string region = configuration[$"{resourceKey}:Region"];

			if (string.IsNullOrWhiteSpace(subscriptionKey))
			{
				throw new ArgumentNullException("SubscriptionKey is null! Did you add that info to secrets.json?");
			}

			if (string.IsNullOrWhiteSpace(region))
			{
				throw new ArgumentNullException("Region is null! Did you add that info to secrets.json?");
			}

			ResourceKeyToConfigs[resourceKey] = new ImmersiveReaderResourceConfig
			{
				SubscriptionKey = subscriptionKey,
				Region = region
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
						Token = token
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
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", resourceConfig.SubscriptionKey);
                using (var response = await client.PostAsync($"https://{resourceConfig.Region}.api.cognitive.microsoft.com/sts/v1.0/issueToken", null))
                {
                    return await response.Content.ReadAsStringAsync();
                }
            }
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