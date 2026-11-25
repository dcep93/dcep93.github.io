# MapControls design

Approved by the user: “ok implement” on 2026-11-25, following the map-only implementation explanation.

Add an independent spire420 MapControls module, enabled by default. On the user's configured trackpad, primary (one-finger) click-and-drag draws and secondary (two-finger) click-and-drag scrolls. These are mouse button events supplied by macOS, not raw touch detection. Drawing stops on primary release. Preserve ordinary room selection, two-finger pan gestures, wheel scrolling, middle-button erasing, toolbar drawing and controller controls.

Use Harmony owner dcep93.spire420.MapControls. Insert a pure left/right enum translation immediately after ButtonIndex getter calls in NMapScreen.ProcessMouseEvent(InputEvent) and ProcessMouseDrawingEvent(InputEvent). Preserve original events, surrounding native logic, labels and exception regions. The inspected handlers contain one and two getters respectively. Patch NMouseHeldMapDrawingInput.get_ListeningButton to return Left for native Right, preserving Middle. Validate all three exact signatures and getter sites before installation. Reject incompatible methods; on installation failure unpatch only this module and let ModuleHost continue others.

Reuse native animation guards, scrolling bounds, drawing lifecycle and networking. Do not patch node buttons, global input, saves or cloud sync. New setting MapControls defaults true, including with older settings files. Bump the draft to 0.2.0. Build and install with the existing atomic installer and settings preservation; no game process control.

Offline verification covers button mapping, drawing release, unchanged other buttons, exact game contracts, IL translation/mismatch rejection, module toggles, plus existing installer and scene checks. Inspect native node event consumption. Manual acceptance: primary draw/release, secondary scroll/release, node click, pan/wheel, middle erase, toolbar and disable toggle. Native gesture testing remains the user's responsibility after their next restart.
