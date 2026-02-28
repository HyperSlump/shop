function sanitizeFileName(name: string) {
    return name
        .trim()
        .replace(/[^a-z0-9._-]+/gi, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 80) || 'download';
}

function getExtensionFromUrl(url: string) {
    try {
        const parsed = new URL(url);
        const filePart = parsed.pathname.split('/').pop() || '';
        const match = filePart.match(/\.([a-z0-9]{2,6})$/i);
        return match ? `.${match[1].toLowerCase()}` : '.zip';
    } catch {
        return '.zip';
    }
}

function triggerDownload(linkUrl: string, fileName: string) {
    const anchor = document.createElement('a');
    anchor.href = linkUrl;
    anchor.download = fileName;
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}

export async function downloadAsset(url: string, itemName: string) {
    if (typeof window === 'undefined') return;

    const extension = getExtensionFromUrl(url);
    const fileName = `${sanitizeFileName(itemName)}${extension}`;

    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`Download failed with status ${response.status}`);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl, fileName);

        setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
        }, 5000);
    } catch (error) {
        // Fallback for providers/browsers that block blob download path.
        window.open(url, '_blank', 'noopener,noreferrer');
        console.warn('Falling back to opening download in a new tab:', error);
    }
}
