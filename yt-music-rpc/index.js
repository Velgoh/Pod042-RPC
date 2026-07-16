const { SMTCMonitor } = require('@coooookies/windows-smtc-monitor');
const RPC = require('discord-rpc');
const YTMusic = require('ytmusic-api');

const clientId = '1515701919346200587';
let rpc = null;
let updatePresenceInterval = null;
const ytmusic = new YTMusic();

let ytMusicReady = false;
ytmusic.initialize().then(() => ytMusicReady = true).catch(console.error);

console.log('Starting YouTube Music Discord RPC...');
let lastUpdate = null;
let currentTimeout = null;

function cleanString(str) {
    if (!str) return '';
    let clean = str;
    
    // Remove annoying bracketed suffixes like (Official Video), [Audio], etc.
    clean = clean.replace(/\s*[([【].*?(?:official|music|video|audio|cover|lyric|live).*?[)\]】]\s*/gi, ' ');
    
    // Remove hyphenated suffixes like - Official Video, - Single
    clean = clean.replace(/\s*-\s*(?:official\s*music\s*video|official\s*video|official\s*audio|audio|cover|lyric\s*video|single|ep).*$/gi, '');

    return clean.trim();
}

async function fetchTrackInfo(title, artist) {
    if (!ytMusicReady) return null;
    try {
        const query = `${title} ${artist}`;
        const results = await ytmusic.searchSongs(query);
        
        if (results && results.length > 0) {
            let track = results[0];
            const titleLower = title.toLowerCase();
            
            // Try to find the BEST match
            let bestMatch = results.find(t => t.name.toLowerCase() === titleLower);
            
            if (!bestMatch) {
                // Avoid 'Live' or 'Audiotree' versions if the original title didn't contain them
                const avoidsLive = !titleLower.includes('live') && !titleLower.includes('audiotree');
                if (avoidsLive) {
                    const nonLive = results.find(t => 
                        !(t.name.toLowerCase().includes('live') || (t.album && t.album.name.toLowerCase().includes('live')) || (t.album && t.album.name.toLowerCase().includes('audiotree')))
                    );
                    if (nonLive) bestMatch = nonLive;
                }
            }
            
            if (bestMatch) track = bestMatch;

            let artworkUrl = null;
            if (track.thumbnails && track.thumbnails.length > 0) {
                const thumb = track.thumbnails[track.thumbnails.length - 1].url;
                artworkUrl = thumb.replace(/=w\d+-h\d+/, '=w512-h512');
            }

            return {
                title: track.name,
                artist: track.artist.name,
                album: track.album ? track.album.name : '',
                artworkUrl: artworkUrl
            };
        }
    } catch (e) {
        console.error(e);
        return null;
    }
    return null;
}

function cleanApiTitle(title) {
    if (!title || !title.includes(' - ')) return title;
    const parts = title.split(' - ').map(p => p.trim());
    
    // Filter out Japanese/Asian parts if there's an English part
    const hasEnglish = parts.some(p => /^[\x00-\x7F]+$/.test(p));
    let validParts = parts;
    if (hasEnglish) {
        // Keep parts that are purely ASCII or don't contain common Asian character blocks
        validParts = parts.filter(p => /^[\x00-\x7F]+$/.test(p) || !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(p));
    }
    
    // Filter out known versions
    const versionRegex = /^(guitar|piano|acoustic|instrumental|live|remix|edit|mix|version|vocal|string|orchestral)(?:\s+version)?$/i;
    validParts = validParts.filter(p => !versionRegex.test(p));
    
    return validParts.length > 0 ? validParts.join(' - ') : parts[0];
}

async function updatePresence() {
    try {
        const sessions = SMTCMonitor.getMediaSessions();
        let foundMusic = false;

        for (const session of sessions) {
            const appId = session.sourceAppId.toLowerCase();
            
            // Only care about browsers
            if (appId.includes('brave') || appId.includes('chrome') || appId.includes('msedge')) {
                const media = session.media;
                const status = session.playback.playbackStatus; // 4 = Playing, 5 = Paused
                
                // If it's a TikTok, ignore immediately
                if (media.title && media.title.toLowerCase().includes('tiktok')) {
                    continue;
                }
                
                // Status 4 is Playing, Status 5 is Paused
                if ((status === 4 || status === 5) && media.title && media.artist) {
                    foundMusic = true;
                    
                    const cleanTitle = cleanString(media.title);
                    const cleanArtist = cleanString(media.artist);
                    const updateKey = `${cleanTitle}-${cleanArtist}-${status}`;
                    
                    if (lastUpdate !== updateKey) {
                        lastUpdate = updateKey;
                        
                        // Verify it's actually YouTube Music and not just regular YouTube
                        const execSync = require('child_process').execSync;
                        let isYTM = false;
                        try {
                            let exeName = session.sourceAppId.toLowerCase();
                            if (!exeName.endsWith('.exe')) exeName += '.exe';
                            const output = execSync(`tasklist /v /fi "imagename eq ${exeName}" /fo csv`, {encoding: 'utf8', windowsHide: true});
                            isYTM = output.includes('YouTube Music');
                        } catch(e) {}
                        
                        if (!isYTM) {
                            console.log(`Ignored (Not YouTube Music): ${media.title}`);
                            rpc.clearActivity();
                            continue;
                        }

                        console.log(`Detected: ${media.title} by ${media.artist} (Status: ${status})`);
                        
                        // Wait a tiny bit to avoid spamming the API on fast skips
                        if (currentTimeout) clearTimeout(currentTimeout);
                        
                        currentTimeout = setTimeout(async () => {
                            const trackInfo = await fetchTrackInfo(cleanTitle, cleanArtist);
                            const finalTitle = trackInfo ? cleanString(cleanApiTitle(trackInfo.title)) : cleanTitle;
                            const finalArtist = cleanArtist;
                            let finalAlbum = trackInfo ? trackInfo.album : '';
                            
                            // Remove '- Single' or '- EP' from the album name so it looks cleaner
                            finalAlbum = finalAlbum.replace(/(?:\s-\sSingle|\s-\sEP)$/i, '');
                            
                            // Prevent redundancy: if album matches track title, clear it
                            if (finalAlbum.toLowerCase() === finalTitle.toLowerCase()) {
                                finalAlbum = '';
                            }
                            
                            const artworkUrl = trackInfo && trackInfo.artworkUrl ? trackInfo.artworkUrl : 'yt_music_logo';
                            
                            console.log(`Updating Discord: ${finalTitle} by ${finalArtist}`);
                            
                            rpc.setActivity({
                                type: 2, // 2 = Listening
                                details: finalTitle,
                                state: `by ${finalArtist}` + (status === 5 ? " (Paused)" : ""),
                                largeImageKey: artworkUrl,
                                largeImageText: finalAlbum || 'YouTube Music',
                                smallImageKey: 'brave_logo',
                                smallImageText: 'Listening on Brave',
                                instance: false,
                            });
                        }, 1000);
                    }
                    break;
                }
            }
        }
        
        if (!foundMusic && lastUpdate !== null) {
            console.log('Music paused or stopped, clearing presence.');
            rpc.clearActivity();
            lastUpdate = null;
            if (currentTimeout) clearTimeout(currentTimeout);
        }
    } catch (e) {
        console.error('Error updating presence:', e.message);
    }
}

function connectRpc() {
    if (rpc) {
        try { rpc.destroy(); } catch(e) {}
    }
    rpc = new RPC.Client({ transport: 'ipc' });
    
    rpc.on('ready', () => {
        console.log('Connected to Discord!');
        if (updatePresenceInterval) clearInterval(updatePresenceInterval);
        updatePresenceInterval = setInterval(updatePresence, 5000);
        updatePresence();
    });

    rpc.login({ clientId }).catch(err => {
        console.error('Discord not ready yet, retrying in 5 seconds...');
        setTimeout(connectRpc, 5000);
    });
}
connectRpc();
