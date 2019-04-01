// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Threading.Tasks;

namespace AdvancedSampleWebApp.Pages
{
	public class MultiLangModel : SampleModel
	{
		public async Task OnGet()
		{
			ViewData["Token"] = await GetTokenAsync(AzureSubscription.Region, AzureSubscription.SubscriptionKey);
		}
	}
}
