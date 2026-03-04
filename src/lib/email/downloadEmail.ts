/**
 * Transactional email template for hyper$lump digital downloads.
 * Kept intentionally simple for broad email-client compatibility.
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
    uiMode?: string;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function buildDownloadEmail({ customerEmail, items, sessionId, appUrl }: EmailOptions): string {
    const normalizedAppUrl = appUrl.replace(/\/$/, '');
    const successUrl = `${normalizedAppUrl}/success?session_id=${sessionId}`;
    const safeCustomerEmail = escapeHtml(customerEmail);
    const safeSuccessUrl = escapeHtml(successUrl);
    const logoUrl = 'https://gusukas6vq4zp6uu.public.blob.vercel-storage.com/Adobe%20Express%20-%20file.png';
    const safeLogoUrl = escapeHtml(logoUrl);

    const itemRows = items.length > 0
        ? items.map((item) => {
            const safeName = escapeHtml(item.name);
            const safeDownloadUrl = escapeHtml(item.downloadUrl);
            const safeLabel = escapeHtml(item.label || 'download');

            return `
                <tr>
                    <td style="padding:0 0 10px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e5e5; border-radius:8px; background:#ffffff;">
                            <tr>
                                <td style="padding:14px 14px; vertical-align:middle;">
                                    <div style="font-size:15px; line-height:1.35; font-weight:600; color:#111111;">
                                        ${safeName}
                                    </div>
                                    <div style="font-size:11px; line-height:1.4; color:#666666; text-transform:uppercase; letter-spacing:0.06em;">
                                        ${safeLabel}
                                    </div>
                                </td>
                                <td style="padding:14px 14px; width:1%; white-space:nowrap; text-align:right; vertical-align:middle;">
                                    <a
                                        href="${safeDownloadUrl}"
                                        style="display:inline-block; background:#111111; color:#ffffff; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:10px 14px; border-radius:6px;"
                                    >
                                        Download
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `;
        }).join('')
        : `
            <tr>
                <td style="padding:0 0 10px 0; font-size:14px; line-height:1.6; color:#666666;">
                    No digital files were attached to this order.
                </td>
            </tr>
        `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your hyper$lump files are ready</title>
</head>
<body style="margin:0; padding:0; background:#f3f3f3; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#111111;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
        Your hyper$lump files are ready to download.
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f3f3;">
        <tr>
            <td align="center" style="padding:28px 16px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
                    <tr>
                        <td align="center" style="padding:0 0 20px;">
                            <a href="https://hyperslump.xyz" style="text-decoration:none;" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="${safeLogoUrl}"
                                    alt="hyper$lump"
                                    width="56"
                                    style="display:block; width:56px; height:auto; border:0; outline:none; text-decoration:none;"
                                />
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 0 16px; font-size:24px; line-height:1.25; font-weight:700; color:#111111;">
                            Thank you for your order.
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 0 16px; font-size:16px; line-height:1.6; color:#333333;">
                            Hi,
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 0 16px; font-size:16px; line-height:1.6; color:#333333;">
                            Your payment is confirmed. Download links are available below. A receipt was sent to
                            <span style="font-weight:600; color:#111111;">${safeCustomerEmail}</span>.
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 0 18px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                ${itemRows}
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 0 26px;">
                            <a
                                href="${safeSuccessUrl}"
                                style="color:#0b63ce; text-decoration:none; font-size:14px; line-height:1.4;"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View order summary
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top:1px solid #dddddd; padding:20px 0 0; font-size:13px; line-height:1.6; color:#777777;">
                            Need help? Contact <a href="mailto:hyperslumpdub@gmail.com" style="color:#0b63ce; text-decoration:none;">hyperslumpdub@gmail.com</a>.
                            <br />
                            &copy; ${new Date().getFullYear()} hyper$lump. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
