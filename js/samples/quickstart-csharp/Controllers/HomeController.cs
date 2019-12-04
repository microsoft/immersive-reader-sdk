// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using QuickstartSampleWebApp.Models;

namespace QuickstartSampleWebApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly AzureActiveDirectoryTokenHelper _tokenHelper;
        private readonly string _subdomain;

        public HomeController(IConfiguration configuration)
        {
            _subdomain = configuration[$"Subdomain"];

            if (string.IsNullOrWhiteSpace(_subdomain))
            {
                throw new ArgumentException($"{nameof(_subdomain)} is empty! Did you add it to secrets.json? See ReadMe.txt.");
            }

            string tenantId = configuration[$"TenantId"];
            string clientId = configuration[$"ClientId"];
            string clientSecret = configuration[$"ClientSecret"];

            _tokenHelper = new AzureActiveDirectoryTokenHelper(tenantId, clientId, clientSecret);
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> GetTokenAndSubdomain()
        {
            try
            {
                string tokenResult = await _tokenHelper.GetTokenAsync();

                return new JsonResult(new { token = tokenResult, subdomain = _subdomain });
            }
            catch (Exception e)
            {
                string message = "Unable to acquire Azure AD token. Check the debugger for more information.";
                Debug.WriteLine(message);
                Debug.WriteLine(e);
                return new JsonResult(new { error = message });
            }
        }
    }
}