// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;

namespace AdvancedSampleWebApp.Pages
{
    public class SamplePageModel : PageModel
    {
        public SamplePageModel(IConfiguration configuration)
        {
        }

        public void OnGet()
        {
            ViewData["Canary"] = Canary.Generate();
        }
    }
}
