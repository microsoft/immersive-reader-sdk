// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

namespace MultipleResourcesSampleWebApp
{
	/// <summary>
	/// Configuration values for a resource created with Azure Active Directory
	/// https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader
	/// </summary>
	public struct ImmersiveReaderResourceConfig
	{
		public string SubscriptionKey { get; set; } // Azure AD Application Service key

		// The location associated with the Immersive Reader resource.
		// The following are valid values for the region:
		// eastus, westus, northeurope, westeurope, centralindia, japaneast, australiaeast
		public string Region { get; set; }
	}
}
