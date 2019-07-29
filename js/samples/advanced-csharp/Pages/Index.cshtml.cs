// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Extensions.Configuration;

namespace AdvancedSampleWebApp.Pages
{
    public class IndexModel : SamplePageModel
    {
        public IndexModel(IConfiguration configuration) : base(configuration)
        {
        }
    }
}