using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MultipleResourcesSampleWebApp
{
	/// <summary>
	/// Parameters used to launch the Immersive Reader on the client side
	/// </summary>
	public struct ImmersiveReaderLaunchParameters
	{
		public string Token { get; set; }
		public string Subdomain { get; set; }
	}
}
