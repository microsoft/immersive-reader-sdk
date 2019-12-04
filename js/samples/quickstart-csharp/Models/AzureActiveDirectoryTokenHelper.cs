// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System;
using System.Threading.Tasks;

namespace QuickstartSampleWebApp.Models
{
    public class AzureActiveDirectoryTokenHelper
    {
        public string TenantId { get; } // TenantId that the Azure AD Application resides in
        public string ClientId { get; } // Azure AD ApplicationId
        public string ClientSecret { get; } // Azure AD Application Service Principal password

        public AzureActiveDirectoryTokenHelper(string tenantId, string clientId, string clientSecret)
        {
            if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            {
                throw new ArgumentException("Credentials missing. Did you add TenantId, ClientId, and ClientSecret to secrets.json? See ReadMe.txt.");
            }

            TenantId = tenantId;
            ClientId = clientId;
            ClientSecret = clientSecret;
        }

        public async Task<string> GetTokenAsync()
        {
            string authority = $"https://login.windows.net/{TenantId}";
            const string resource = "https://cognitiveservices.azure.com/";

            AuthenticationContext authContext = new AuthenticationContext(authority);
            ClientCredential clientCredential = new ClientCredential(ClientId, ClientSecret);

            AuthenticationResult authResult = await authContext.AcquireTokenAsync(resource, clientCredential);

            return authResult.AccessToken;
        }
    }
}
