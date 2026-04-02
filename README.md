# 省市区县四级联动选择器

一个基于uni-app开发的省市区县四级联动选择器组件，支持多种样式和多端兼容。

## 功能特点

1. **四级联动**：支持省市区县四级选择，可通过参数控制显示三级或四级
2. **两种样式**：
   - Picker样式：滚轮式选择器，类似原生选择器
   - 仿淘宝样式：标签页式依次选取
3. **数据来源**：从本地JSON文件获取可靠的省市区县数据
   - 三级联动数据：pca-code.js
   - 四级联动数据：pcas-code.js
4. **多端兼容**：基于uni-app开发，支持H5、小程序、App等多平台
5. **自定义弹窗**：不依赖其他组件库，实现了自定义弹窗效果
6. **动画效果**：从底部向上弹出的平滑动画
7. **可定制性**：支持自定义标题、按钮颜色等

## 安装方法

本组件符合 easycom 规范，HBuilderX 2.5.5 起，只需将本组件导入项目，在页面 template 中即可直接使用，无需在页面中 import 和注册 components。

## 使用示例

### 基本使用

```vue
<template>
  <view>
    <view class="trigger-button" @click="showPicker = true">
      选择地区
    </view>
    <yc-address-picker 
      v-model="showPicker"
      :level="4"
      mode="picker"
      @confirm="onConfirm"
    />
  </view>
</template>

<script>
export default {
  data() {
    return {
      showPicker: false
    };
  },
  methods: {
    onConfirm(result) {
      console.log('选择结果:', result);
    }
  }
};
</script>

<style scoped>
.trigger-button {
  padding: 20rpx;
  background-color: #f0f0f0;
  text-align: center;
  border-radius: 8rpx;
  margin: 20rpx;
}
</style>
```

### 自定义按钮颜色和激活颜色

```vue
<yc-address-picker 
  v-model="showPicker"
  :level="3"
  :mode="'taobao'"
  :cancel-color="'#999'"
  :confirm-color="'#ff6600'"
  :active-color="'#ff6600'"
  @confirm="onConfirm"
/>
```

## 参数说明

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value / v-model | Boolean | false | 控制选择器的显示和隐藏 |
| selected-value | Object | {} | 初始选中值 |
| level | Number | 3 | 控制显示级别：3-省市区，4-省市区县 |
| mode | String | 'picker' | 选择器样式：'picker'-滚轮样式，'taobao'-仿淘宝样式 |
| title | String | '选择地区' | 弹窗标题 |
| disabled | Boolean | false | 是否禁用 |
| cancel-color | String | '#007aff' | 取消按钮颜色 |
| confirm-color | String | '#007aff' | 确认按钮颜色 |
| active-color | String | '#007aff' | taobao模式的选择字样激活颜色 |

## 事件说明

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| confirm | 确认选择时触发 | 选择结果对象，包含province、city、district、town（四级时） |
| input | 确认选择时触发（v-model双向绑定） | 选择结果对象 |

## 数据结构

### 选择结果对象结构

```javascript
{
  province: { code: '110000', name: '北京市' },
  city: { code: '110100', name: '北京市' },
  district: { code: '110101', name: '东城区' },
  town: { code: '110101001', name: '东华门街道' } // 四级时才有
}
```

## 注意事项

1. **多端兼容**：组件使用了uni-app的跨平台能力，可在不同平台上正常运行
2. **动画效果**：组件添加了从底部向上弹出的动画效果，提供更好的用户体验
3. **淘宝模式高度**：淘宝模式的高度会根据屏幕高度自动调整，最高为屏幕高度的70%

## 浏览器兼容性

- H5：支持所有现代浏览器
- 小程序：支持微信小程序、支付宝小程序等
- App：支持iOS和Android

## 版本说明

- v1.0.0：初始版本，支持省市区县四级联动选择，两种样式，多端兼容