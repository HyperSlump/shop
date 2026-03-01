/**
 * Branded Resend email template for hyper$lump digital download delivery.
 * Pure HTML string — no react-email dependency needed.
 */

interface DownloadItem {
    name: string;
    downloadUrl: string;
    label: string;
}

interface EmailOptions {
    customerEmail: string;
    items: DownloadItem[];
    sessionId: string;
    appUrl: string;
}

export function buildDownloadEmail({ items, sessionId, appUrl }: EmailOptions): string {
    const successUrl = `${appUrl}/success?session_id=${sessionId}`;

    const itemRows = items.map((item) => `
        <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #1a1a1a;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding-right: 16px; vertical-align: top; width: 40px;">
                            <div style="width: 40px; height: 40px; background: #111; border: 1px solid #222; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-family: monospace; color: #444; font-size: 10px;">//</span>
                            </div>
                        </td>
                        <td style="vertical-align: middle;">
                            <div style="font-family: monospace; font-size: 11px; color: #888; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;">${item.label}</div>
                            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; font-weight: 600; color: #ffffff;">${item.name}</div>
                        </td>
                        <td style="vertical-align: middle; text-align: right; white-space: nowrap; padding-left: 16px;">
                            <a href="${item.downloadUrl}"
                               style="display: inline-block; background: #ffffff; color: #000000; padding: 8px 18px; text-decoration: none; font-family: monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 4px;">
                                DOWNLOAD
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>hyper$lump — Download Ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 48px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1a1a1a;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <div style="font-family: monospace; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">h$</div>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="font-family: monospace; font-size: 9px; color: #444; letter-spacing: 0.2em; text-transform: uppercase;">ACCESS_GRANTED</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 32px 32px 0 32px;">
                            <div style="font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 8px; letter-spacing: -0.01em;">
                                Your files are ready.
                            </div>
                            <div style="font-size: 14px; color: #666666; line-height: 1.6; margin-bottom: 28px;">
                                Payment confirmed. Download your files directly below — links don't expire.
                            </div>

                            <!-- Download Items -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tbody>
                                    ${itemRows}
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <!-- CTA -->
                    <tr>
                        <td style="padding: 24px 32px 0 32px;">
                            <a href="${successUrl}"
                               style="display: block; text-align: center; border: 1px solid #222; color: #666; padding: 12px; text-decoration: none; font-family: monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 6px;">
                                View Order Summary →
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px 32px 32px; border-top: 1px solid #1a1a1a; margin-top: 24px;">
                            <div style="margin-top: 24px; font-family: monospace; font-size: 9px; color: #333; letter-spacing: 0.1em; text-transform: uppercase; text-align: center;">
                                hyper$lump · All rights reserved · <a href="${appUrl}" style="color: #444; text-decoration: none;">hyperslump.com</a>
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
