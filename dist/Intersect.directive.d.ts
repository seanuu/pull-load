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
declare function inserted(el: HTMLElement, binding: ObserveVNodeDirective): void;
declare function unbind(el: HTMLElement): void;
export declare const Intersect: {
    inserted: typeof inserted;
    unbind: typeof unbind;
};
export default Intersect;
