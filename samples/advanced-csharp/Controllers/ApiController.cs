using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System;
using System.IO;
using System.Threading.Tasks;

namespace AdvancedSampleWebApp.Pages
{
	[Route("api")]
	[ApiController]
	public class ApiController : ControllerBase
	{
		private readonly string TenantId;     // Azure subscription TenantId
		private readonly string ClientId;     // AAD ApplicationId
		private readonly string ClientSecret; // AAD Application Service Principal password

		public ApiController(Microsoft.Extensions.Configuration.IConfiguration configuration)
		{
			TenantId = configuration["TenantId"];
			ClientId = configuration["ClientId"];
			ClientSecret = configuration["ClientSecret"];

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
		}

		[Route("token")]
		[HttpPost]
		[Consumes("text/plain")]
		[Produces("text/plain")]
		public async Task<string> Token()
		{
			// Retrieve the canary value and authenticate
			string canary;
			using (StreamReader reader = new StreamReader(Request.Body))
			{
				canary = reader.ReadToEnd();
			}

			if (string.IsNullOrEmpty(canary))
			{
				throw new Exception("Canary missing");
			}

			if (!Canary.Validate(canary))
			{
				throw new Exception("Authentication failed");
			}

			// Obtain a token using the subscription key
			return await GetTokenAsync();
		}

		protected async Task<string> GetTokenAsync()
		{
			string authority = $"https://login.windows-ppe.net/{TenantId}";
			const string resource = "https://ppe.cognitiveservices.azure.com/";

			AuthenticationContext authContext = new AuthenticationContext(authority);
			ClientCredential clientCredential = new ClientCredential(ClientId, ClientSecret);

			AuthenticationResult authResult = await authContext.AcquireTokenAsync(resource, clientCredential);

			return authResult.AccessToken;
		}
	}
}