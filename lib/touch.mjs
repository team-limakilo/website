const MODE_NONE = 0;
const MODE_SWIPE = 1;
const MODE_SCROLL = 2;

/**
 * @param {HTMLElement} handle
 * @param {HTMLElement} target
 * @param {HTMLElement} shade
 * @param {"open" | "close"} mode
 * @param {boolean} scrollable
 * @param {() => boolean} condition
 * @param {() => void} trigger
 */
export function addTouchOpenCloseHandler(handle, target, shade, mode, scrollable, condition, trigger) {
    /** @type {{ x: number, y: number, id: number, time: number }[]} */
    let touchTrail;

    /** @type {{ x: number, y: number, id: number, time: number }?} */
    let touchStart;

    /** @type {number} */
    let touchMode;

    function removeListeners() {
        handle.removeEventListener("touchmove", onTouchMove);
        handle.removeEventListener("touchend", onTouchEnd);
    }

    /**
     * @param {TouchEvent} event
     */
    function saveTouch(event) {
        const touch = event.targetTouches[0] || event.changedTouches[0];
        if (touch == null) {
            return;
        }
        while (touchTrail.length > 0 && event.timeStamp - touchTrail[0].time > 100) {
            touchTrail.shift();
        }
        touchTrail.push({ x: touch.clientX, y: touch.clientY, id: touch.identifier, time: event.timeStamp });
        return touchTrail[touchTrail.length - 1];
    }

    /** @param {TouchEvent} event */
    function onTouchStart(event) {
        if (condition()) {
            touchTrail = [];
            touchStart = saveTouch(event);
            if (touchStart == null) {
                return;
            }
            touchMode = MODE_SWIPE;
            for (let element = event.target; element != null; element = element.parentElement) {
                if (element === target && scrollable) {
                    touchMode = MODE_NONE;
                    break;
                }
            }
            target.style.transition = "none";
            shade.style.transition = "none";
            handle.addEventListener("touchmove", onTouchMove, { passive: false });
            handle.addEventListener("touchend", onTouchEnd);
        }
    }

    /** @param {TouchEvent} event */
    function onTouchMove(event) {
        if (condition() && touchMode !== MODE_SCROLL) {
            if (touchStart == null) {
                return onTouchStart(event);
            }
            const touch = saveTouch(event);
            if (touch == null || touch.id !== touchStart.id) {
                return;
            }
            if (touchMode === MODE_NONE) {
                const moveX = Math.abs(touch.x - touchStart.x);
                const moveY = Math.abs(touch.y - touchStart.y);
                if (moveY > 0 && moveY >= moveX) {
                    touchMode = MODE_SCROLL;
                    removeListeners();
                    return;
                } else if (moveX > 0) {
                    touchMode = MODE_SWIPE;
                }
            }
            if (touchMode === MODE_SWIPE) {
                
                if (mode === "close") {
                    const offset = Math.min(touch.x - touchStart.x, 0);
                    target.style.left = `${offset}px`;
                    shade.style.opacity = offset / target.clientWidth + 1;
                } else {
                    const offset = Math.min(touch.x - touchStart.x, body.clientWidth);
                    target.style.left = `calc(${offset}px - 100%)`;
                    shade.style.opacity = offset / target.clientWidth;
                }
            }
            event.preventDefault();
        }
    }

    /** @param {TouchEvent} event */
    function onTouchEnd(event) {
        if (touchMode === MODE_SWIPE && condition()) {
            const lastTouch = saveTouch(event);
            if (lastTouch.id !== touchStart.id) {
                return;
            }
            let velocity = 0;
            if (touchTrail.length > 0) {
                const distanceMoved = lastTouch.x - touchTrail[0].x;
                const timeDiff = lastTouch.time - touchTrail[0].time;
                velocity = timeDiff > 0 ? distanceMoved / timeDiff : 0;
            }
            target.style.transition = "";
            target.style.left = "";
            const PREDICT_MS = 200;
            const offset = lastTouch.x - touchStart.x;
            const predictedOffset = Math.abs(offset + velocity * PREDICT_MS);
            if (mode === "close") {
                const predictedTouch = lastTouch.x + velocity * PREDICT_MS;
                const borderHit = predictedTouch < -target.clientWidth * 0.1;
                const halfHidden = predictedOffset > target.clientWidth * 0.5;
                if (velocity <= 0 && (borderHit || halfHidden)) {
                    trigger();
                }
            } else {
                const predictedTouch = lastTouch.x + velocity * PREDICT_MS;
                const borderHit = predictedTouch > target.clientWidth * 0.9;
                const halfShown = predictedOffset > target.clientWidth * 0.5;;
                if (velocity >= 0 && (borderHit || halfShown)) {
                    trigger();
                }
            }
            target.style.left = "";
            target.style.transition = "";
            shade.style.transition = "";
            shade.style.opacity = "";
            touchMode = MODE_NONE;
            touchStart = null;
            removeListeners();
        }
    }

    body.addEventListener("touchstart", onTouchStart, { passive: false });
}
