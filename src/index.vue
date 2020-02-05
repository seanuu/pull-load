<template>
    <div class="pull-load">
        <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
            <symbol id="icon-spinner2" viewBox="0 0 1024 1024">
                <path
                    d="M1024 512c-1.28-66.848-15.776-133.504-42.592-194.464-26.72-60.992-65.472-116.256-113.056-161.92-47.552-45.696-103.936-81.824-164.992-105.664C642.4 26.048 576.8 14.624 512 16c-64.8 1.28-129.344 15.36-188.32 41.344-59.04 25.888-112.544 63.456-156.736 109.568-44.224 46.08-79.168 100.704-102.176 159.808C41.632 385.792 30.624 449.248 32 512c1.28 62.752 14.976 125.152 40.128 182.208 25.088 57.088 61.472 108.832 106.112 151.552 44.608 42.752 97.472 76.512 154.624 98.72C389.984 966.784 451.296 977.376 512 976c60.704-1.28 120.96-14.56 176.064-38.912 55.136-24.288 105.12-59.488 146.368-102.656 41.28-43.136 73.856-94.24 95.264-149.44 13.024-33.472 21.888-68.416 26.528-103.808 1.248 0.064 2.496 0.128 3.776 0.128 35.36 0 64-28.64 64-64 0-1.792-0.096-3.584-0.224-5.344L1024 512zM922.304 681.952c-23.488 53.216-57.472 101.408-99.168 141.184-41.664 39.808-91.008 71.2-144.256 91.776C625.664 935.584 568.608 945.376 512 944c-56.608-1.312-112.608-13.728-163.808-36.48-51.264-22.656-97.696-55.488-136-95.712-38.336-40.192-68.544-87.776-88.32-139.072C104 621.472 94.624 566.528 96 512c1.312-54.56 13.312-108.416 35.264-157.696 21.856-49.312 53.504-93.984 92.256-130.816 38.72-36.864 84.544-65.856 133.888-84.864C406.72 119.584 459.52 110.624 512 112c52.512 1.312 104.224 12.928 151.552 34.048 47.36 21.056 90.272 51.488 125.632 88.768 35.392 37.248 63.2 81.28 81.376 128.672C888.832 410.912 897.344 461.568 896 512l0.224 0c-0.128 1.76-0.224 3.552-0.224 5.344 0 33.024 24.992 60.16 57.088 63.616C946.848 615.776 936.544 649.76 922.304 681.952z"
                ></path>
            </symbol>
        </svg>

        <div class="pull-load__top-tip" :style="tipStyles" ref="topTip">
            <slot name="topTip" :progress="progress" :active="progress >= threshold" :loading="pullStatus === STATUS.Loading">
                <svg class="icon tip-icon" :class="{ spin: pullStatus === STATUS.Loading }" :style="tipIconStyles">
                    <use xlink:href="#icon-spinner2"></use>
                </svg>
            </slot>
        </div>

        <div class="pull-load__body">
            <slot></slot>
        </div>

        <div class="pull-load__bottom-tip" v-intersect.quiet="handleIntersect" v-if="onLazy">
            <template v-if="lazyStatus === STATUS.Loading">
                <slot name="bottomTip">
                    <svg class="icon tip-icon spin lazy-icon">
                        <use xlink:href="#icon-spinner2"></use>
                    </svg>
                </slot>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Intersect from './inserted.directive';

const threshold = 0.7;
const rotate = function(value: number) {
    return value > threshold ? 720 : (value / threshold) * 720;
};

enum STATUS {
    Loading,
    Complete,
    Pulling
}
export default Vue.extend({
    props: {
        onPull: Function,
        pull: {
            type: Boolean,
            default: true
        },
        onLazy: Function,
        lazy: {
            type: Boolean,
            default: true
        }
    },
    directives: { Intersect },
    data() {
        return {
            mouseY: 0,
            maxTipHeight: 0,
            progress: 0,
            STATUS,
            pullStatus: STATUS.Complete,
            lazyStatus: STATUS.Complete,
            threshold,
            nomore: false
        };
    },
    computed: {
        tipElement(): HTMLElement {
            return (this.$refs as any).topTip as HTMLElement;
        },
        tipStyles(): Object {
            return {
                height: this.progress * this.maxTipHeight + 'px'
            };
        },
        tipIconStyles(): Object {
            return {
                transform: `rotate(${rotate(this.progress)}deg)`
            };
        }
    },
    methods: {
        initEvent(): void {
            if (!this.onPull) return;

            const touchable = 'ontouchstart' in document;
            const touchStart = touchable ? 'touchstart' : 'mousedown';
            const touchmove = touchable ? 'touchmove' : 'mousemove';
            const touchend = touchable ? 'touchend' : 'mouseup';

            this.$el.addEventListener(touchStart, this.handleTouchStart);
            document.addEventListener(touchmove, this.handleTouchMove, { passive: false });
            document.addEventListener(touchend, this.handleTouchEnd);

            this.$on('hook:beforeDestroy', () => {
                this.$el.removeEventListener(touchStart, this.handleTouchStart);
                document.removeEventListener(touchmove, this.handleTouchMove);
                document.removeEventListener(touchend, this.handleTouchEnd);
            });
        },
        handleTouchStart(event: Event): void {
            if (!this.pull || this.pullStatus === STATUS.Loading) return;

            this.pullStatus = STATUS.Pulling;
            this.mouseY = this.touchPositionY(event);
        },
        handleTouchMove(event: Event): void {
            if (!this.pull || this.pullStatus !== STATUS.Pulling) return;

            let pullRatio = 2;
            let offsetY = this.mouseY - this.touchPositionY(event);

            if (offsetY > 0) return;

            if (this.progress !== 0) {
                event.cancelable && event.preventDefault();
                this.$el.scrollTop = 0;
                this.$el.parentElement && (this.$el.parentElement.scrollTop = 0);
                this.progress = Math.min(Math.abs(offsetY / pullRatio / this.maxTipHeight), 1);
                return;
            }

            if (this.$el.scrollTop > 0 && this.progress === 0) {
                return;
            }

            if (this.progress === 0) {
                this.mouseY = this.touchPositionY(event);
                offsetY = 1;
            }

            this.progress = Math.min(Math.abs(offsetY / pullRatio / this.maxTipHeight), 1);
        },
        handleTouchEnd(): void {
            if (!this.pull || !this.progress || this.pullStatus === STATUS.Loading) return;

            if (this.progress >= threshold) {
                this.refresh();
            } else {
                this.pullReset();
            }
        },
        touchPositionY(event: Event): number {
            return event instanceof TouchEvent ? event.targetTouches[0].pageY : (event as MouseEvent).pageY;
        },
        pullLoading() {
            this.animateToProgress(threshold);
            this.pullStatus = STATUS.Loading;
        },
        refresh(): void {
            this.nomore = false;
            this.pullLoading();

            this.onPull &&
                this.onPull(() => {
                    this.pullReset();
                });
        },
        pullReset(): void {
            this.pullStatus = STATUS.Complete;
            this.animateToProgress(0);
        },
        animateToProgress(toprogress: number) {
            let _this = this;
            let startTime = (typeof performance === 'undefined' ? Date : performance).now();
            let start = this.progress;
            let speed = Math.abs(this.progress - toprogress);
            let duration = 200 * speed;
            this.pullStatus = STATUS.Complete;

            requestAnimationFrame(function animate() {
                let elapsedTime = (typeof performance === 'undefined' ? Date : performance).now() - startTime;
                let t = Math.abs(elapsedTime / duration);
                if (_this.progress <= toprogress || t > 1) {
                    _this.progress = toprogress;
                } else {
                    _this.progress = start - t * speed;
                    requestAnimationFrame(animate);
                }
            });
        },
        handleIntersect(entries: IntersectionObserverEntry[]) {
            if (this.nomore || this.lazyStatus === STATUS.Loading) return;
            if (!entries[0].isIntersecting) return;

            this.lazyStatus = STATUS.Loading;

            this.onLazy((nomore: boolean) => {
                this.lazyReset(nomore);
            });
        },
        lazyReset(nomore: boolean) {
            this.lazyStatus = STATUS.Complete;
            this.nomore = nomore;
        }
    },
    mounted(): void {
        this.maxTipHeight = parseInt(getComputedStyle(this.tipElement).maxHeight as string);
        this.initEvent();
    }
});
</script>

<style lang="scss" scoped>
.pull-load {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;

    &__body {
        flex: 1;
    }

    &__top-tip {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        width: 100%;
        height: 0;
        max-height: 25vh;
        z-index: 1;
        text-align: center;
        overflow: hidden;
    }

    &__bottom-tip {
        position: relative;
        text-align: center;
        overflow: hidden;
    }
}

.tip-icon {
    font-size: 1.25em;
}

.lazy-icon {
    margin: 0.25em 0;
}

.icon {
    position: relative;
    fill: currentColor;
    width: 1em;
    height: 1em;
    vertical-align: -0.125em;
}

.spin {
    animation: spin 500ms linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
