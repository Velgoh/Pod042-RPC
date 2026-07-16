# Pod 042 // YouTube Music Discord RPC

Pod 042 is a lightweight, stealthy background process designed to seamlessly detect music playing on web browsers (Brave, Chrome, Edge) and broadcast it natively to your Discord Rich Presence. 

Built with an obsessive focus on seamless execution and minimalism, Pod 042 runs completely invisibly and handles all the edge cases of YouTube Music metadata formatting so your Discord profile always looks pristine.

## Features

*   **Absolute Stealth:** Surgically compiled with modified Windows PE headers to run entirely in the GUI subsystem. No flashing command prompts, no taskbar icons, just pure background execution.
*   **Smart Metadata Filtering:** Automatically scrubs out annoying title suffixes like `(Official Music Video)`, `[Audio]`, and `- Single`. Ensures your Discord status shows clean, readable song names.
*   **Redundancy Checks:** Intelligently detects if a track's album name is identical to the track title and removes the redundant text to keep the profile looking sharp.
*   **Single-Instance Lock:** Enforced concurrency protection via an internal port lock. It is physically impossible to run duplicate background instances.
*   **Native Auto-Start:** Deploys directly into the Windows Startup folder via a one-click batch script, guaranteeing Pod 042 boots up silently every time you turn on your machine.

## Installation

Pod 042 requires zero dependencies, zero configuration files, and absolutely no Node.js installations on the target machine.

1.  Download the latest release containing `Pod042.exe` and `Install.bat`.
2.  Double click `Install.bat`.

The installation script will automatically map the executable, create a native Windows Startup shortcut, and initialize the stealth background process immediately.

## Removal

To uninstall, simply delete the `Pod 042` shortcut from your Windows Startup folder (`Win + R` -> `shell:startup`), and delete `Pod042.exe`.

---
*Glory to mankind.*
