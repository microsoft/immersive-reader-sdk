using ImmersiveReader_testapp_mvc.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace quickstart_csharp_azfunction.Controllers
{
    public class HomeController : Controller
    {
        private readonly string _FunctionUrl;
        private readonly string _FunctionAPIKey;
        private readonly string _FunctionLocalUrl;

        public HomeController(Microsoft.Extensions.Configuration.IConfiguration configuration, ILogger<HomeController> logger)
        {
            _logger = logger;
            _FunctionUrl = configuration["FunctionUrl"];
            _FunctionAPIKey = configuration["FunctionAPIKey"];
            _FunctionLocalUrl = configuration["FunctionLocalUrl"];

            if (string.IsNullOrWhiteSpace(_FunctionUrl))
            {
                throw new ArgumentNullException("FunctionUrl is null! Did you add that info to secrets.json?");
            }

            if (string.IsNullOrWhiteSpace(_FunctionAPIKey))
            {
                throw new ArgumentNullException("FunctionAPIKey is null! Did you add that info to secrets.json?");
            }

            if (string.IsNullOrWhiteSpace(_FunctionLocalUrl))
            {
                throw new ArgumentNullException("FunctionLocalUrl is null! Did you add that info to secrets.json?");
            }
        }

        private readonly ILogger<HomeController> _logger;

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
                var response = new { functionUrl = _FunctionUrl, functionApiKey = _FunctionAPIKey, functionLocalUrl = _FunctionLocalUrl };
                return new JsonResult(response);
            }
            catch (Exception ex) {
                return new JsonResult(new { error = ex.Message });
            }
        }
    }
}
