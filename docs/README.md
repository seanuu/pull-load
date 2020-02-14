# 概览

Vue PullLoad 组件提供简便易扩展的下拉刷新与滚动持续加载的能力

```vue
<template> 
    <pull-load :on-pull="handlePullLoad" :on-lazy="handleLazyLoad">
        <div class="data-list"
             v-for="(item, index) in dataList" :key="index">
            <span>{{item}}</span>
        </div>
    </pull-load>
</template>

<script>
export default {
    data() {
        return { dataList: [] };
    },
    methods: {
        handlePullLoad(onComplete) {
            // do refresh ...
            onComplete(); // when finished call onComplete to reset component
        },
        handleLazyLoad(onComplete) {
            // load more ...
            // onComplete(); // when finished call onComplete to reset component
            onComplete(true); // set parameter true when nomore data can be load
        }
    }
}
</script>
```
