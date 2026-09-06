import dns from 'dns';
import ipaddr from 'ipaddr.js';

/**
 * Validates whether a hostname or IP address resolves to a public, non-private target.
 * Prevents SSRF attacks on localhost, internal infrastructure, cloud metadata, and private IP ranges.
 */
export async function validateTargetIpAndHostname(hostname: string): Promise<{
  safe: boolean;
  ip?: string;
  reason?: string;
}> {
  const cleanHost = hostname.trim().toLowerCase().replace(/^\[|\]$/g, '');

  // 1. Check prohibited hostname strings
  if (
    cleanHost === 'localhost' ||
    cleanHost.endsWith('.localhost') ||
    cleanHost.endsWith('.local') ||
    cleanHost.endsWith('.internal') ||
    cleanHost.endsWith('.lan') ||
    cleanHost === 'metadata.google.internal'
  ) {
    return {
      safe: false,
      reason: `Blocked target hostname '${cleanHost}' (Internal/Local domain)`,
    };
  }

  // 2. Resolve DNS to IPv4/IPv6 address
  let resolvedIp: string;
  try {
    const lookupResult = await dns.promises.lookup(cleanHost, { family: 0 });
    resolvedIp = lookupResult.address;
  } catch (err: any) {
    return {
      safe: false,
      reason: `DNS Resolution failed for hostname '${cleanHost}': ${err.message || 'Domain does not exist'}`,
    };
  }

  // 3. Parse and check IP range safety using ipaddr.js
  try {
    const parsedIp = ipaddr.parse(resolvedIp);
    const range = parsedIp.range();

    // Dangerous ranges in ipaddr.js: 'loopback', 'private', 'linkLocal', 'multicast', 'unspecified', 'carrierGradeNat'
    const forbiddenRanges = [
      'loopback',
      'private',
      'linkLocal',
      'multicast',
      'unspecified',
      'carrierGradeNat',
      'uniqueLocal',
    ];

    if (forbiddenRanges.includes(range)) {
      return {
        safe: false,
        ip: resolvedIp,
        reason: `Blocked request to IP ${resolvedIp} (Reserved/Private range: ${range})`,
      };
    }

    // Explicit check for AWS/GCP/Azure Cloud metadata IP
    if (resolvedIp === '169.254.169.254') {
      return {
        safe: false,
        ip: resolvedIp,
        reason: `Blocked request to cloud metadata service (${resolvedIp})`,
      };
    }

    return {
      safe: true,
      ip: resolvedIp,
    };
  } catch (err) {
    return {
      safe: false,
      reason: `Failed to parse resolved IP address: ${resolvedIp}`,
    };
  }
}
