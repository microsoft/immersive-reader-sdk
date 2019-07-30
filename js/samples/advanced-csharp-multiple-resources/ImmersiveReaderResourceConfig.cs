using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MultipleResourcesSampleWebApp
{
	/// <summary>
	/// Configuration values for a resource created with Azure Active Directory
	/// https://docs.microsoft.com/en-us/azure/cognitive-services/immersive-reader/azure-active-directory-authentication
	/// </summary>
	public struct ImmersiveReaderResourceConfig
	{
		public string TenantId { get; set; } // Azure subscription TenantId
		public string ClientId { get; set; } // Azure AD ApplicationId
		public string ClientSecret { get; set; } // Azure AD Application Service Principal password
		public string Subdomain { get; set; } // Immersive Reader resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created with Azure CLI Powershell. Check the Azure portal for the subdomain on the Endpoint in the resource Overview page, for example, 'https://[SUBDOMAIN].cognitiveservices.azure.com/')
	}
}
