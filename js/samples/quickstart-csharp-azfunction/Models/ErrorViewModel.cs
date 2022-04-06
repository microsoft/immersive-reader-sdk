using System;

namespace ImmersiveReader.Samples.QuickStart.AzureFunction.Models
{
    public class ErrorViewModel
    {
        public string RequestId { get; set; }

        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}
