import { VNodeDirective } from 'vue/types/vnode';

declare global {
    interface HTMLElement {
        _observe?: {
            init: boolean;
            observer: IntersectionObserver;
        };
    }
}

interface ObserveVNodeDirective extends VNodeDirective {
    options?: IntersectionObserverInit;
}

function inserted(el: HTMLElement, binding: ObserveVNodeDirective) {
    const modifiers = binding.modifiers || {};
    const value = binding.value;
    const isObject = typeof value === 'object';
    const callback = isObject ? value.handler : value;
    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[] = [], observer: IntersectionObserver) => {
        if (!el._observe) return;

        if (callback && (!modifiers.quiet || el._observe.init)) {
            const isIntersecting = Boolean(entries.find(entry => entry.isIntersecting));

            callback(entries, observer, isIntersecting);
        }

        if (el._observe.init && modifiers.once) unbind(el);
        else el._observe.init = true;
    }, value.options || {});

    el._observe = { init: false, observer };
    observer.observe(el);
}

function unbind(el: HTMLElement) {
    if (!el._observe) return;

    el._observe.observer.unobserve(el);
    delete el._observe;
}

export const Intersect = {
    inserted,
    unbind
};

export default Intersect;
