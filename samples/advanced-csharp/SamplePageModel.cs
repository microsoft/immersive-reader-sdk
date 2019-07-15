// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using System;

namespace AdvancedSampleWebApp.Pages
{
    public class SamplePageModel : PageModel
    {
        public readonly string Subdomain; // Immersive Reader cognitive service resource subdomain (resource 'Name' if the resource was created in the Azure portal, or 'CustomSubDomain' option if the resource was created in Powershell - check the Azure portal for the subdomain on the Endpoint in the resource Overview page, e.g. it will look like 'https://[SUBDOMAIN].cognitiveservices.azure.com/')

        public SamplePageModel(IConfiguration configuration)
        {
            Subdomain = configuration["Subdomain"];

            if (string.IsNullOrWhiteSpace(Subdomain))
            {
                throw new ArgumentNullException("Subdomain is null! Did you add that info to secrets.json? See ReadMe.txt.");
            }
        }

        public void OnGet()
        {
            this.
            ViewData["Canary"] = Canary.Generate();
            ViewData["Subdomain"] = Subdomain;
        }
    }
}
