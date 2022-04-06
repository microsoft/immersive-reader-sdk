using ImmersiveReader.Samples.QuickStart.AzureFunction.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace ImmersiveReader.Samples.QuickStart.AzureFunction.Controllers
{
    public class HomeController : Controller
    {
        private readonly string FunctionUrl;
        private readonly string FunctionAPIKey;
        private readonly string FunctionLocalUrl;

        public HomeController(Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            FunctionUrl = configuration["FunctionDeployedToAzureUrl"];
            FunctionAPIKey = configuration["FunctionAPIKey"];
            FunctionLocalUrl = configuration["FunctionDeployedLocallyUrl"];

            if (string.IsNullOrWhiteSpace(FunctionUrl))
            {
                throw new ArgumentNullException("FunctionUrl is null! Did you add that info to secrets.json?");
            }

            if (string.IsNullOrWhiteSpace(FunctionAPIKey))
            {
                throw new ArgumentNullException("FunctionAPIKey is null! Did you add that info to secrets.json?");
            }

            if (string.IsNullOrWhiteSpace(FunctionLocalUrl))
            {
                throw new ArgumentNullException("FunctionLocalUrl is null! Did you add that info to secrets.json?");
            }
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpGet]
        public async Task<JsonResult> GetFunctionInfo()
        {
            try
            {
                var response = new { functionUrl = FunctionUrl, functionApiKey = FunctionAPIKey, functionLocalUrl = FunctionLocalUrl };
                return new JsonResult(response);
            }
            catch (Exception ex) {
                return new JsonResult(new { error = ex.Message });
            }
        }
    }
}
