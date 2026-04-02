<template>
	<view class="content">
		<view class="container">
			<text class="title">省市区县四级联动选择器</text>

			<view class="section">
				<text class="section-title">Picker样式（省市区三级）</text>
				<view class="trigger-button" @click="showPicker1 = true">
					选择地区
				</view>
				<yc-address-picker v-model="showPicker1" :selected-value="modelValue1" :level="3" mode="picker"
					title="选择地区" :disabled="false" @confirm="onConfirm1" />
				<view class="result" v-if="result1">
					<text>选择结果：{{ result1.province.name }} {{ result1.city.name }} {{ result1.district.name }}</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">Picker样式（省市区县四级）</text>
				<view class="trigger-button" @click="showPicker2 = true">
					选择地区
				</view>
				<yc-address-picker v-model="showPicker2" :selected-value="modelValue2" :level="4" mode="picker"
					title="选择地区" :disabled="false" @confirm="onConfirm2" />
				<view class="result" v-if="result2">
					<text>选择结果：{{ result2.province.name }} {{ result2.city.name }} {{ result2.district.name }}
						{{ result2.town.name }}</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">淘宝样式（省市区三级）</text>
				<view class="trigger-button" @click="showPicker3 = true">
					选择地区
				</view>
				<yc-address-picker v-model="showPicker3" :selected-value="modelValue3" :level="3" mode="taobao"
					title="选择地区" :disabled="false" @confirm="onConfirm3" />
				<view class="result" v-if="result3">
					<text>选择结果：{{ result3.province.name }} {{ result3.city.name }} {{ result3.district.name }}</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">淘宝样式（省市区县四级）</text>
				<view class="trigger-button" @click="showPicker4 = true">
					选择地区
				</view>
				<yc-address-picker v-model="showPicker4" :selected-value="modelValue4" :level="4" mode="taobao"
					title="选择地区" :disabled="false" @confirm="onConfirm4" />
				<view class="result" v-if="result4">
					<text>选择结果：{{ result4.province.name }} {{ result4.city.name }} {{ result4.district.name }}
						{{ result4.town.name }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				result1: null,
				result2: null,
				result3: null,
				result4: null,
				showPicker1: false,
				showPicker2: false,
				showPicker3: false,
				showPicker4: false,
				modelValue1: {},
				modelValue2: {},
				modelValue3: {},
				modelValue4: {}
			}
		},
		onLoad() {

		},
		methods: {
			onConfirm1(result) {
				this.result1 = result;
				console.log('选择结果1:', result);
			},
			onConfirm2(result) {
				this.result2 = result;
				console.log('选择结果2:', result);
			},
			onConfirm3(result) {
				this.result3 = result;
				console.log('选择结果3:', result);
			},
			onConfirm4(result) {
				this.result4 = result;
				console.log('选择结果4:', result);
			}
		}
	}
</script>

<style>
	.content {
		padding: 20rpx;
		background-color: #f5f5f5;
	}

	.container {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.title {
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 40rpx;
		color: #333;
	}

	.section {
		margin-bottom: 40rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 500;
		margin-bottom: 20rpx;
		color: #666;
	}

	.trigger-button {
		padding: 20rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		background-color: #fff;
		cursor: pointer;
		text-align: center;
		font-size: 32rpx;
		color: #333;
		margin-bottom: 20rpx;
	}

	.trigger-button:hover {
		background-color: #f5f5f5;
	}

	.result {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #f0f0f0;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;
	}
</style>