// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AdvancedSampleWebApp.Pages
{
    public class MultiLangModel : PageModel
    {
        public void OnGet()
        {
            ViewData["Canary"] = Canary.Generate();
        }
    }
}