// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Extensions.Configuration;

namespace AdvancedSampleWebApp.Pages
{
    public class MathModel : SamplePageModel
    {
        public MathModel(IConfiguration configuration) : base(configuration)
        {
        }
    }
}