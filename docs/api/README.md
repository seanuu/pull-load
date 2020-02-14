## 基本配置

## Props

### onPull

- 类型：'Function'
- 默认值：''

设置参数后启用下拉刷新功能，当下拉到阀值时触发绑定函数，同时给绑定函数传入onComplete函数

### onLazy

- 类型：'Function'
- 默认值：''

设置参数后启用滚动加载功能，当滚动至页尾时触发传入函数，同时给绑定函数传入onComplete函数

## Slots

### default

默认插槽

### topTip

```
slot-scope="{progress, active, loading}"
```

- progress
    - 类型：number

返回下拉时的下拉程度，0-1，默认在0.6时触发active

- active
    - 类型：boolean

下拉程度是否到了下拉触发回调的阀值

- loading
    - 类型：boolean

触发刷新后，绑定函数未调用onComplete函数时，loading为true


### bottomTip

页尾滚动加载的提示插槽

### nomore

页尾滚动加载没有更多时的提示插槽
