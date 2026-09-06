import { ScanResult, ThreatLevel } from '../types';

/**
 * Translates technical detection indicators into plain, user-friendly English
 */
export function humanizeReason(reason: string): string {
  const r = reason.toLowerCase();

  if (r.includes('direct ip') || r.includes('ip address')) {
    return 'The website uses a numeric IP address instead of a recognized domain name.';
  }
  if (r.includes('@ symbol')) {
    return 'The web address contains an "@" symbol, which can disguise the real destination.';
  }
  if (r.includes('excessive subdomain') || r.includes('subdomain nesting')) {
    return 'The website address uses multiple layered subdomains, a pattern often seen in fraudulent links.';
  }
  if (r.includes('punycode') || r.includes('homograph')) {
    return 'The address uses foreign or lookalike characters designed to deceive visitors.';
  }
  if (r.includes('brand') && (r.includes('mismatch') || r.includes('not match'))) {
    return 'The website identity could not be verified (claims to represent an organization, but the domain does not match).';
  }
  if (r.includes('password') || r.includes('credential')) {
    return 'This website is requesting sensitive information (login password or credentials).';
  }
  if (r.includes('otp') || r.includes('one-time')) {
    return 'This website is requesting one-time verification codes (OTPs).';
  }
  if (r.includes('payment') || r.includes('banking') || r.includes('card')) {
    return 'This website is requesting payment, card, or banking details.';
  }
  if (r.includes('redirect')) {
    return 'The website redirects to another address.';
  }
  if (r.includes('unencrypted') || r.includes('plain http') || r.includes('insecure')) {
    return 'The connection to this website is unencrypted (HTTP).';
  }
  if (r.includes('automaton detected high-risk') || r.includes('structural pattern')) {
    return 'The website address contains unusual characteristics and formatting.';
  }
  if (r.includes('keyword') || r.includes('lexical')) {
    return 'The address includes security or account verification keywords often used in scams.';
  }
  if (r.includes('mismatched hyperlink') || r.includes('deceptive link')) {
    return 'The page contains links where the visible text differs from where the link actually leads.';
  }
  if (r.includes('inaccessible') || r.includes('dns failed')) {
    return 'The website could not be reached or its domain could not be resolved.';
  }

  // Capitalize first letter and return clean string
  return reason.charAt(0).toUpperCase() + reason.slice(1);
}

/**
 * Human-friendly threat classification badge & labels
 * Note: Never says "100% safe", uses "LOW RISK" instead of "SAFE"
 */
export function getHumanThreatBadge(level: ThreatLevel): {
  label: string;
  badgeClass: string;
  textColor: string;
  borderColor: string;
  bgCard: string;
  dotColor: string;
  summary: string;
} {
  switch (level) {
    case 'PHISHING':
      return {
        label: 'PHISHING',
        badgeClass: 'bg-red-950 text-red-300 border-red-500/60',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/50',
        bgCard: 'bg-red-950/20 border-red-500/40',
        dotColor: 'bg-red-500',
        summary: 'This website shows multiple clear signs of being a phishing scam designed to steal personal data.',
      };
    case 'HIGH_RISK':
      return {
        label: 'HIGH RISK',
        badgeClass: 'bg-orange-950 text-orange-300 border-orange-500/60',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/50',
        bgCard: 'bg-orange-950/20 border-orange-500/40',
        dotColor: 'bg-orange-500',
        summary: 'This website displays suspicious characteristics associated with malicious or deceptive sites.',
      };
    case 'SUSPICIOUS':
      return {
        label: 'SUSPICIOUS',
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-500/60',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/50',
        bgCard: 'bg-amber-950/20 border-amber-500/40',
        dotColor: 'bg-amber-500',
        summary: 'This website has unusual patterns. Exercise caution and verify before entering sensitive information.',
      };
    case 'SAFE':
    default:
      return {
        label: 'LOW RISK',
        badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-500/60',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/50',
        bgCard: 'bg-emerald-950/20 border-emerald-500/40',
        dotColor: 'bg-emerald-500',
        summary: 'No major warning signs were detected. Still check the website address carefully before entering sensitive information.',
      };
  }
}

/**
 * Actionable safety advice for the user based on classification
 */
export function getActionGuidance(level: ThreatLevel): {
  primaryNotice: string;
  recommendations: string[];
} {
  if (level === 'PHISHING' || level === 'HIGH_RISK') {
    return {
      primaryNotice: 'Do not enter your password, OTP, banking details, card information, or personal documents.',
      recommendations: [
        'Do not enter your password or username on this page.',
        'Never share one-time passcodes (OTPs) or PINs.',
        'Do not enter banking details, credit card numbers, or upload identity documents.',
        'If you followed a link from an email, SMS, or chat message, close this page immediately.',
        "Verify through the organization's known official app or website.",
      ],
    };
  }

  if (level === 'SUSPICIOUS') {
    return {
      primaryNotice: 'Verify the website address before entering sensitive information.',
      recommendations: [
        'Check the spelling of the website address in your browser bar for subtle typos.',
        'Avoid logging in or entering payment info until you have confirmed the site identity.',
        'If an email or message instructed you to click this link, navigate to the official service manually.',
      ],
    };
  }

  return {
    primaryNotice: 'No major warning signs were detected. Still check the website address carefully before entering sensitive information.',
    recommendations: [
      'Confirm the website address matches the company you intend to visit.',
      'Look for the padlock symbol indicating an encrypted connection in your browser.',
      'Remember that no security scanner can guarantee 100% safety — always practice standard caution.',
    ],
  };
}

/**
 * Checks for sensitive input fields (passwords, OTPs, payments) and returns a prominent safety notice
 */
export function getSensitiveInfoNotice(scan: ScanResult): {
  hasWarning: boolean;
  isCritical: boolean;
  fieldsList: string[];
  message: string;
} {
  const content = scan.module2.validation.content;
  const fieldsList: string[] = [];

  if (content?.hasPasswordFields) fieldsList.push('Password entry fields');
  if (content?.hasOtpFields) fieldsList.push('One-time password (OTP) fields');
  if (content?.hasPaymentFields) fieldsList.push('Credit card or banking fields');
  if (content?.hasForms && !content?.hasPasswordFields && !content?.hasPaymentFields) {
    fieldsList.push('User data submission forms');
  }

  const isHighRisk = scan.threatLevel === 'HIGH_RISK' || scan.threatLevel === 'PHISHING';
  const hasMismatch = scan.module2.brand.relationship === 'MISMATCH';

  if (fieldsList.length === 0 && !hasMismatch) {
    return { hasWarning: false, isCritical: false, fieldsList: [], message: '' };
  }

  const isCritical = isHighRisk || hasMismatch;

  const message = isCritical
    ? 'This website is requesting sensitive information (such as passwords or account details) while displaying high-risk indicators. Do not enter any credentials, OTPs, or financial information.'
    : "This website is requesting sensitive information. Make sure you have verified that you are on the organization's official website before entering your details.";

  return {
    hasWarning: true,
    isCritical,
    fieldsList,
    message,
  };
}
