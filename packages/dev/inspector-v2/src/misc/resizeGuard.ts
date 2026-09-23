// Tracks the last-seen canvas size and device pixel ratio so callers can skip
// engine.resize() (which forces layout) when nothing actually changed.
// The first check always reports a change.
export class EngineResizeGuard {
    private _lastWidth: number | null = null;
    private _lastHeight: number | null = null;
    private _lastDevicePixelRatio: number | null = null;

    public shouldResize(clientWidth: number, clientHeight: number, devicePixelRatio: number): boolean {
        if (clientWidth !== this._lastWidth || clientHeight !== this._lastHeight || devicePixelRatio !== this._lastDevicePixelRatio) {
            this._lastWidth = clientWidth;
            this._lastHeight = clientHeight;
            this._lastDevicePixelRatio = devicePixelRatio;
            return true;
        }
        return false;
    }
}
