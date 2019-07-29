// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace AdvancedSampleWebApp
{
    public class Canary
    {
        public const int KeyLength = 32;
        public const int NonceLength = 32;

        private static readonly byte[] _key;
        private static TimeSpan ExpirationSpan = TimeSpan.FromHours(24);


        static Canary()
        {
            // Create a key that will be valid for the length of this session
            using (RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider())
            {
                _key = new byte[KeyLength];
                rng.GetBytes(_key);
            }
        }

        public static string Generate()
        {
            // Create a nonce
            string nonce;
            using (RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider())
            {
                byte[] nonceBytes = new byte[NonceLength];
                rng.GetBytes(nonceBytes);
                nonce = Convert.ToBase64String(nonceBytes);
            }

            // Current UTC time is used to create a canary that will expire
            string time = DateTime.UtcNow.Ticks.ToString(CultureInfo.InvariantCulture);

            return Generate(nonce, time);
        }

        private static string Generate(string nonce, string time)
        {
            // Combine nonce and time and generate an HMAC
            using (HMACSHA256 hmac = new HMACSHA256(_key))
            {
                byte[] dataBytes = Encoding.UTF8.GetBytes(nonce + "," + time);
                byte[] canary = hmac.ComputeHash(dataBytes);
                return nonce + "," + Convert.ToBase64String(canary) + "," + time;
            }
        }

        public static bool Validate(string canary)
        {
            if (string.IsNullOrEmpty(canary))
                throw new ArgumentNullException(nameof(canary));

            // Extract parts of the from canary
            int comma1 = canary.IndexOf(',');
            if (comma1 <= 0)
            {
                return false;
            }
            string nonce = canary.Substring(0, comma1);

            int comma2 = canary.IndexOf(',', comma1 + 1);
            if (comma2 <= comma1)
            {
                return false;
            }
            string time = canary.Substring(comma2 + 1);
            long ticks;
            if (!long.TryParse(time, NumberStyles.Integer, CultureInfo.InvariantCulture, out ticks))
            {
                return false;
            }
            try
            {
                DateTime canaryTime = new DateTime(ticks);
                if (DateTime.UtcNow - canaryTime > ExpirationSpan)
                {
                    return false;
                }
            }
            catch (ArgumentOutOfRangeException)
            {
                return false;
            }

            return 0 == string.Compare(canary, Generate(nonce, time), false, CultureInfo.InvariantCulture);
        }
    }
}
