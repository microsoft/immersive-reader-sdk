using System.Net;
using System.Threading.Tasks;
using Azure.Core;
using Azure.Identity;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace quickstart_azure_function_csharp.GetAzureADToken
{
    public static class ManagedIdentityAzureADTokenProvider
    {
        const string subdomain = "ImmersiveReader-TestCristobal072021";

        [Function("GetAzureADToken")]
        public static async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequestData req, FunctionContext executionContext)
        {
            var logger = executionContext.GetLogger("GetAzureADToken");
            logger.LogInformation("C# HTTP trigger function processed a request to get an Azure AD token.");

            var response = req.CreateResponse(HttpStatusCode.OK);

            var tokenCredential = new DefaultAzureCredential();
            var accessToken = await tokenCredential.GetTokenAsync(
               new TokenRequestContext(scopes: new string[] { "https://cognitiveservices.azure.com/" }) { }
            );
            
            await response.WriteAsJsonAsync(new { token = accessToken.Token, subdomain = subdomain });

            return response;
        }
    }
}
