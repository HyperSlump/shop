export type PreviewAudioConfig = {
    audioUrl: string;
    loopStart?: number;
    loopEnd?: number;
};

const LOOP_START_KEYS = ['audio_loop_start', 'preview_loop_start', 'loop_start'] as const;
const LOOP_END_KEYS = ['audio_loop_end', 'preview_loop_end', 'loop_end'] as const;

function readFirstMetadataValue(metadata: Record<string, string> | undefined, keys: readonly string[]) {
    if (!metadata) return '';

    for (const key of keys) {
        const value = metadata[key]?.trim();
        if (value) return value;
    }

    return '';
}

function parseTimeValue(rawValue: string) {
    const normalized = rawValue.trim().toLowerCase();
    if (!normalized) return undefined;

    const millisecondsMatch = normalized.match(/^(-?\d+(?:\.\d+)?)\s*ms$/);
    if (millisecondsMatch) {
        const milliseconds = Number.parseFloat(millisecondsMatch[1]);
        return Number.isFinite(milliseconds) ? milliseconds / 1000 : undefined;
    }

    const secondsMatch = normalized.match(/^(-?\d+(?:\.\d+)?)\s*s$/);
    if (secondsMatch) {
        const seconds = Number.parseFloat(secondsMatch[1]);
        return Number.isFinite(seconds) ? seconds : undefined;
    }

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function getPreviewAudioConfig(metadata: Record<string, string> | undefined): PreviewAudioConfig | null {
    const audioUrl = readFirstMetadataValue(metadata, ['audio_preview']);
    if (!audioUrl) return null;

    const rawLoopStart = parseTimeValue(readFirstMetadataValue(metadata, LOOP_START_KEYS));
    const rawLoopEnd = parseTimeValue(readFirstMetadataValue(metadata, LOOP_END_KEYS));
    const loopStart = typeof rawLoopStart === 'number' ? Math.max(0, rawLoopStart) : undefined;
    const loopEnd = typeof rawLoopEnd === 'number' ? Math.max(0, rawLoopEnd) : undefined;

    return {
        audioUrl,
        ...(typeof loopStart === 'number' && loopStart > 0 ? { loopStart } : {}),
        ...(typeof loopEnd === 'number' && loopEnd > (loopStart ?? 0) ? { loopEnd } : {}),
    };
}
