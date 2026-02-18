const TraceSession = require("../models/TraceSessionModel");

// Using ip-api.com - free, no API key needed, 45 requests/minute limit
const IPAPI_BASE_URL = "http://ip-api.com/json";

// Helper function to check if IP is private/reserved
function isPrivateOrReservedIP(ip) {
  if (!ip || typeof ip !== 'string') return true;
  
  // IPv4 private ranges
  if (ip === '127.0.0.1' || ip.startsWith('127.')) return true; // Loopback
  if (ip.startsWith('10.')) return true; // Private Class A
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true; // Private Class B
    }
  }
  if (ip.startsWith('192.168.')) return true; // Private Class C
  
  // IPv6 private/reserved
  if (ip === '::1' || ip === 'localhost') return true; // IPv6 loopback
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true; // IPv6 unique local
  if (ip.startsWith('fe80:')) return true; // IPv6 link-local
  if (ip.startsWith('::ffff:127.')) return true; // IPv4-mapped IPv6 loopback
  
  // Link-local IPv4
  if (ip.startsWith('169.254.')) return true; // Link-local
  
  return false;
}

async function fetchIpInfoForSessions() {
  try {
    // Find one session without IP info (newest first - LIFO)
    const session = await TraceSession.findOne({
      ip: { $exists: true, $ne: null, $ne: "" },
      $or: [
        { ipInfoFetchedAt: { $exists: false } },
        { ipInfoFetchedAt: null }
      ]
    }).sort({ createdAt: -1 });

    if (!session) {
      console.log("No sessions pending for IP info fetch");
      return { processed: 0 };
    }

    const ip = session.ip;
    console.log(`Fetching IP info for: ${ip}`);

    // Skip private/reserved IPs
    if (isPrivateOrReservedIP(ip)) {
      console.log(`Skipping private/reserved IP: ${ip}`);
      // Mark as processed with error so we don't try again
      await TraceSession.updateMany(
        { ip: ip },
        { 
          ipInfoFetchedAt: new Date(),
          "ipInfo.error": "Private or reserved IP"
        }
      );
      return { processed: 0, skipped: true, reason: "Private or reserved IP" };
    }

    try {
      // Fetch IP info from ip-api.com
      // Note: Using fields parameter to get specific fields and reduce response size
      const fields = "city,region,regionName,country,countryCode,continent,continentCode,lat,lon,timezone,isp,org,as,asname,status,message";
      const response = await fetch(`${IPAPI_BASE_URL}/${ip}?fields=${fields}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Mark as processed even on HTTP error so we don't retry immediately
        const errorMsg = `HTTP error! status: ${response.status}`;
        console.error(`IP ${ip} fetch failed: ${errorMsg}`);
        await TraceSession.updateMany(
          { ip: ip },
          { 
            ipInfoFetchedAt: new Date(),
            "ipInfo.error": errorMsg
          }
        );
        return { processed: 0, error: errorMsg };
      }

      const data = await response.json();

      // Check if API returned success
      if (data.status === 'fail') {
        console.log(`IP ${ip} error: ${data.message}`);
        // Mark as fetched so we don't try again
        await TraceSession.updateMany(
          { ip: ip },
          { 
            ipInfoFetchedAt: new Date(),
            "ipInfo.error": data.message
          }
        );
        return { processed: 0, error: data.message };
      }

      // Prepare IP info object (mapping ip-api.com fields to our schema)
      const ipInfo = {
        city: data.city,
        region: data.regionName || data.region,
        country: data.country,
        countryCode: data.countryCode,
        continentCode: data.continentCode,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        org: data.org || data.isp,
        asn: data.as,
        ipVersion: null, // ip-api doesn't provide this
      };

      // Update ALL sessions with the same IP
      const updateResult = await TraceSession.updateMany(
        { ip: ip },
        { 
          ipInfo: ipInfo,
          ipInfoFetchedAt: new Date()
        }
      );

      const count = updateResult.modifiedCount || updateResult.nModified || 0;
      console.log(`Updated ${count} sessions for IP ${ip}`);
      
      return { 
        processed: count,
        ip: ip,
        country: data.country
      };

    } catch (fetchError) {
      // Mark as processed even on network/fetch errors
      console.error(`IP ${ip} network error: ${fetchError.message}`);
      await TraceSession.updateMany(
        { ip: ip },
        { 
          ipInfoFetchedAt: new Date(),
          "ipInfo.error": fetchError.message
        }
      );
      return { processed: 0, error: fetchError.message };
    }

  } catch (error) {
    console.error("Error in fetchIpInfoForSessions:", error.message);
    return { processed: 0, error: error.message };
  }
}

async function fetchIpInfoForSpecificIP(ip) {
  try {
    if (!ip) {
      return { processed: 0, error: "IP address is required" };
    }

    console.log(`Fetching IP info for specific IP: ${ip}`);

    // Skip private/reserved IPs
    if (isPrivateOrReservedIP(ip)) {
      console.log(`Skipping private/reserved IP: ${ip}`);
      // Mark as processed with error so we don't try again
      await TraceSession.updateMany(
        { ip: ip },
        {
          ipInfoFetchedAt: new Date(),
          "ipInfo.error": "Private or reserved IP"
        }
      );
      return { processed: 0, skipped: true, reason: "Private or reserved IP" };
    }

    try {
      // Fetch IP info from ip-api.com
      const fields = "city,region,regionName,country,countryCode,continent,continentCode,lat,lon,timezone,isp,org,as,asname,status,message";
      const response = await fetch(`${IPAPI_BASE_URL}/${ip}?fields=${fields}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status}`;
        console.error(`IP ${ip} fetch failed: ${errorMsg}`);
        await TraceSession.updateMany(
          { ip: ip },
          {
            ipInfoFetchedAt: new Date(),
            "ipInfo.error": errorMsg
          }
        );
        return { processed: 0, error: errorMsg };
      }

      const data = await response.json();

      // Check if API returned success
      if (data.status === 'fail') {
        console.log(`IP ${ip} error: ${data.message}`);
        await TraceSession.updateMany(
          { ip: ip },
          {
            ipInfoFetchedAt: new Date(),
            "ipInfo.error": data.message
          }
        );
        return { processed: 0, error: data.message };
      }

      // Prepare IP info object
      const ipInfo = {
        city: data.city,
        region: data.regionName || data.region,
        country: data.country,
        countryCode: data.countryCode,
        continentCode: data.continentCode,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        org: data.org || data.isp,
        asn: data.as,
        ipVersion: null,
      };

      // Update ALL sessions with the same IP
      const updateResult = await TraceSession.updateMany(
        { ip: ip },
        {
          ipInfo: ipInfo,
          ipInfoFetchedAt: new Date()
        }
      );

      const count = updateResult.modifiedCount || updateResult.nModified || 0;
      console.log(`Updated ${count} sessions for IP ${ip}`);

      return {
        processed: count,
        ip: ip,
        country: data.country,
        city: data.city,
        region: data.regionName || data.region
      };

    } catch (fetchError) {
      console.error(`IP ${ip} network error: ${fetchError.message}`);
      await TraceSession.updateMany(
        { ip: ip },
        {
          ipInfoFetchedAt: new Date(),
          "ipInfo.error": fetchError.message
        }
      );
      return { processed: 0, error: fetchError.message };
    }

  } catch (error) {
    console.error("Error in fetchIpInfoForSpecificIP:", error.message);
    return { processed: 0, error: error.message };
  }
}

module.exports = { fetchIpInfoForSessions, fetchIpInfoForSpecificIP };
