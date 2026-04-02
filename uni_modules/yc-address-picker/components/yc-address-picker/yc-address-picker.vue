<template>
	<view class="city-picker-container">
		<!-- 自定义弹窗 -->
		<view v-if="modelValue" class="city-picker-popup" :class="{ 'show': showAnimation }" @touchmove.stop>
			<!-- 遮罩层 -->
			<view class="city-picker-mask" @click="closePicker"></view>

			<!-- 弹窗内容 -->
			<view class="city-picker-content" :class="{ 'show': showAnimation }">
				<!-- 标题栏 -->
				<view class="city-picker-header">
					<text class="city-picker-cancel" @click="closePicker" :style="{ color: cancelColor }">取消</text>
					<text class="city-picker-title">{{ title }}</text>
					<text class="city-picker-confirm" @click="confirmSelection"
						:style="{ color: confirmColor }">确定</text>
				</view>

				<!-- Picker样式 -->
				<view v-if="mode === 'picker'" class="city-picker-picker">
					<picker-view :value="pickerValue" @change="onPickerChange" :indicator-style="indicatorStyle"
						style="width: 100%; height: 300rpx;">
						<!-- 省 -->
						<picker-view-column>
							<view v-for="(province, index) in provinces" :key="province.code" class="picker-item">
								{{ province.name }}
							</view>
						</picker-view-column>

						<!-- 市 -->
						<picker-view-column>
							<view v-for="(city, index) in cities" :key="city.code" class="picker-item">
								{{ city.name }}
							</view>
						</picker-view-column>

						<!-- 区 -->
						<picker-view-column>
							<view v-for="(district, index) in districts" :key="district.code" class="picker-item">
								{{ district.name }}
							</view>
						</picker-view-column>

						<!-- 县/镇 -->
						<picker-view-column v-if="level === 4">
							<view v-for="(town, index) in towns" :key="town.code" class="picker-item">
								{{ town.name }}
							</view>
						</picker-view-column>
					</picker-view>
				</view>

				<!-- 仿淘宝样式（依次选取） -->
				<view v-else-if="mode === 'taobao'" class="city-picker-taobao" :style="{ height: taobaoHeight }">
					<!-- 已选择区域 -->
					<view class="city-picker-selected">
						<text class="selected-label">已选择：</text>
						<text class="selected-text">{{ displayText }}</text>
					</view>
					<!-- 标签栏 -->
					<view class="city-picker-tabs">
						<view v-for="(tab, index) in tabs" :key="index" class="city-picker-tab"
							:class="{ 'active': currentTab === index }"
							:style="{ color: currentTab === index ? activeColor : '' }" @click="switchTab(index)">
							{{ tab.name }}
						</view>
					</view>

					<!-- 内容区 -->
					<view class="city-picker-tab-content">
						<!-- 省列表 -->
						<view v-if="currentTab === 0" class="city-list">
							<view v-for="(province, index) in provinces" :key="province.code" class="city-item"
								:style="{ color: currentProvince && currentProvince.code === province.code ? activeColor : '' }"
								@click="selectProvince(province)">
								{{ province.name }}
							</view>
						</view>

						<!-- 市列表 -->
						<view v-else-if="currentTab === 1" class="city-list">
							<view v-for="(city, index) in cities" :key="city.code" class="city-item"
								:style="{ color: currentCity && currentCity.code === city.code ? activeColor : '' }"
								@click="selectCity(city)">
								{{ city.name }}
							</view>
						</view>

						<!-- 区列表 -->
						<view v-else-if="currentTab === 2" class="city-list">
							<view v-for="(district, index) in districts" :key="district.code" class="city-item"
								:style="{ color: currentDistrict && currentDistrict.code === district.code ? activeColor : '' }"
								@click="selectDistrict(district)">
								{{ district.name }}
							</view>
						</view>

						<!-- 县/镇列表 -->
						<view v-else-if="currentTab === 3 && level === 4" class="city-list">
							<view v-for="(town, index) in towns" :key="town.code" class="city-item"
								:style="{ color: currentTown && currentTown.code === town.code ? activeColor : '' }"
								@click="selectTown(town)">
								{{ town.name }}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getProvinces,
		getCities,
		getDistricts,
		getTowns
	} from '../../static/yc-address-picker/data.js';

	export default {
		name: 'yc-address-picker',
		props: {
			// 控制显示级别：3-省市区，4-省市区县
			level: {
				type: Number,
				default: 3,
				validator: (value) => [3, 4].includes(value)
			},
			// 选择器样式：picker-滚轮样式，taobao-仿淘宝样式
			mode: {
				type: String,
				default: 'picker',
				validator: (value) => ['picker', 'taobao'].includes(value)
			},
			// 控制显示隐藏（v-model，Vue 2）
			value: {
				type: Boolean,
				default: false
			},
			// 控制显示隐藏（v-model，Vue 3）
			modelValue: {
				type: Boolean,
				default: false
			},
			// 初始选中值
			selectedValue: {
				type: Object,
				default: () => ({})
			},
			// 标题
			title: {
				type: String,
				default: '选择地区'
			},
			// 是否禁用
			disabled: {
				type: Boolean,
				default: false
			},
			// 取消按钮颜色
			cancelColor: {
				type: String,
				default: '#007aff'
			},
			// 确认按钮颜色
			confirmColor: {
				type: String,
				default: '#007aff'
			},
			// taobao模式的选择字样激活颜色
			activeColor: {
				type: String,
				default: '#007aff'
			}
		},

		data() {
			return {
				provinces: [],
				cities: [],
				districts: [],
				towns: [],
				pickerValue: [0, 0, 0, 0],
				currentProvince: null,
				currentCity: null,
				currentDistrict: null,
				currentTown: null,
				currentTab: 0,
				indicatorStyle: `height: 50rpx;`,
				screenHeight: 0,
				showAnimation: false
			};
		},
		watch: {
			modelValue(newValue) {
				if (newValue) {
					// 当modelValue变为true时，先渲染元素，然后触发动画
					this.$nextTick(() => {
						this.showAnimation = true;
					});
				} else {
					// 当modelValue变为false时，先触发动画，然后隐藏元素
					this.showAnimation = false;
					setTimeout(() => {
						// 动画结束后再隐藏
					}, 300);
				}
			}
		},
		mounted() {
			this.loadData();
			this.initValue();
			this.getScreenHeight();
		},
		computed: {
			displayText() {
				const {
					currentProvince,
					currentCity,
					currentDistrict,
					currentTown,
					level,
					currentTab
				} = this;
				const parts = [];
				if (currentProvince) parts.push(currentProvince.name);
				if (currentCity) parts.push(currentCity.name);
				if (currentDistrict) parts.push(currentDistrict.name);
				if (currentTown && level === 4) parts.push(currentTown.name);
				return parts.join(' ') || '请选择地区';
			},
			tabs() {
				const tabs = [{
						name: '省份',
						index: 0
					},
					{
						name: '城市',
						index: 1
					},
					{
						name: '区县',
						index: 2
					}
				];
				if (this.level === 4) {
					tabs.push({
						name: '乡镇',
						index: 3
					});
				}
				return tabs;
			},
			taobaoHeight() {
				// 计算淘宝模式的高度，最高为屏幕高度的70%
				return this.screenHeight > 0 ? `${Math.min(this.screenHeight * 0.7, 600)}px` : '700rpx';
			}
		},
		watch: {
			modelValue(newValue) {
				if (newValue) {
					// 当modelValue变为true时，先渲染元素，然后触发动画
					this.$nextTick(() => {
						this.showAnimation = true;
					});
				} else {
					// 当modelValue变为false时，先触发动画，然后隐藏元素
					this.showAnimation = false;
					setTimeout(() => {
						// 动画结束后再隐藏
					}, 300);
				}
			},
			level(newLevel, oldLevel) {
				// 当level变化时，重新加载数据
				this.provinces = [];
				this.cities = [];
				this.districts = [];
				this.towns = [];
				this.currentProvince = null;
				this.currentCity = null;
				this.currentDistrict = null;
				this.currentTown = null;
				this.currentTab = 0;
				this.loadData();
			}
		},
		methods: {
			// 获取屏幕高度
			getScreenHeight() {
				uni.getSystemInfo({
					success: (res) => {
						this.screenHeight = res.screenHeight;
					}
				});
			},
			// 加载数据
			async loadData() {
				try {
					this.provinces = await getProvinces(this.level);
					if (this.provinces.length > 0 && !this.currentProvince) {
						this.currentProvince = this.provinces[0];
						this.loadCities();
					}
				} catch (error) {
					console.error('加载省份数据失败:', error);
				}
			},
			// 初始化值
			initValue() {
				if (this.selectedValue && (this.selectedValue.province || this.selectedValue.city || this.selectedValue
						.district || this.selectedValue.town)) {
					this.currentProvince = this.selectedValue.province;
					this.currentCity = this.selectedValue.city;
					this.currentDistrict = this.selectedValue.district;
					this.currentTown = this.selectedValue.town;
				}
			},

			// 加载城市数据
			async loadCities() {
				if (!this.currentProvince) return;
				try {
					this.cities = await getCities(this.currentProvince.code, this.level);
					if (this.cities.length > 0) {
						// 只有在普通模式下才自动赋值第一个
						if (this.mode === 'picker' && !this.currentCity) {
							this.currentCity = this.cities[0];
						}
						this.loadDistricts();
					}
				} catch (error) {
					console.error('加载城市数据失败:', error);
				}
			},

			// 加载区县数据
			async loadDistricts() {
				if (!this.currentCity) return;
				try {
					this.districts = await getDistricts(this.currentCity.code, this.level);
					if (this.districts.length > 0) {
						// 只有在普通模式下才自动赋值第一个
						if (this.mode === 'picker' && !this.currentDistrict) {
							this.currentDistrict = this.districts[0];
						}
						if (this.level === 4) {
							this.loadTowns();
						}
					}
				} catch (error) {
					console.error('加载区县数据失败:', error);
				}
			},

			// 加载乡镇数据
			async loadTowns() {
				if (!this.currentDistrict) return;
				try {
					this.towns = await getTowns(this.currentDistrict.code);
					// 只有在普通模式下才自动赋值第一个
					if (this.mode === 'picker' && this.towns.length > 0 && !this.currentTown) {
						this.currentTown = this.towns[0];
					}
				} catch (error) {
					console.error('加载乡镇数据失败:', error);
				}
			},



			// 关闭选择器
			closePicker() {
				// 触发Vue 2的v-model事件
				this.$emit('input', false);
				// 触发Vue 3的v-model事件
				this.$emit('update:modelValue', false);
			},

			// 确认选择
			confirmSelection() {
				// 校验是否所有必要选项都已选择
				if (!this.currentProvince) {
					uni.showToast({
						title: '请选择省份',
						icon: 'none'
					});
					return;
				}
				if (!this.currentCity) {
					uni.showToast({
						title: '请选择城市',
						icon: 'none'
					});
					return;
				}
				if (!this.currentDistrict) {
					uni.showToast({
						title: '请选择区县',
						icon: 'none'
					});
					return;
				}
				if (this.level === 4 && !this.currentTown) {
					uni.showToast({
						title: '请选择乡镇',
						icon: 'none'
					});
					return;
				}
				
				const result = {
					province: this.currentProvince,
					city: this.currentCity,
					district: this.currentDistrict
				};
				if (this.level === 4) {
					result.town = this.currentTown;
				}
				this.$emit('confirm', result);
				// 触发选择结果事件
				this.$emit('select', result);
				this.closePicker();
			},

			// Picker值变化
			onPickerChange(e) {
				const value = e.detail.value;
				const [provinceIndex, cityIndex, districtIndex, townIndex] = value;

				// 省份变化
				if (provinceIndex !== this.pickerValue[0]) {
					this.currentProvince = this.provinces[provinceIndex];
					this.loadCities().then(() => {
						this.currentCity = this.cities[0];
						this.loadDistricts().then(() => {
							this.currentDistrict = this.districts[0];
							if (this.level === 4) {
								this.loadTowns().then(() => {
									this.currentTown = this.towns[0];
									// 更新pickerValue，确保下标正确
									this.pickerValue = [provinceIndex, 0, 0, 0];
								});
							} else {
								// 更新pickerValue，确保下标正确
								this.pickerValue = [provinceIndex, 0, 0, 0];
							}
						});
					});
				}
				// 城市变化
				else if (cityIndex !== this.pickerValue[1]) {
					this.currentCity = this.cities[cityIndex];
					this.loadDistricts().then(() => {
						this.currentDistrict = this.districts[0];
						if (this.level === 4) {
							this.loadTowns().then(() => {
								this.currentTown = this.towns[0];
								// 更新pickerValue，确保下标正确
								this.pickerValue = [provinceIndex, cityIndex, 0, 0];
							});
						} else {
							// 更新pickerValue，确保下标正确
							this.pickerValue = [provinceIndex, cityIndex, 0, 0];
						}
					});
				}
				// 区县变化
				else if (districtIndex !== this.pickerValue[2]) {
					this.currentDistrict = this.districts[districtIndex];
					if (this.level === 4) {
						this.loadTowns().then(() => {
							this.currentTown = this.towns[0];
							// 更新pickerValue，确保下标正确
							this.pickerValue = [provinceIndex, cityIndex, districtIndex, 0];
						});
					} else {
						// 更新pickerValue，确保下标正确
						this.pickerValue = [provinceIndex, cityIndex, districtIndex, 0];
					}
				}
				// 乡镇变化
				else if (this.level === 4 && townIndex !== this.pickerValue[3]) {
					this.currentTown = this.towns[townIndex];
					// 更新pickerValue，确保下标正确
					this.pickerValue = [provinceIndex, cityIndex, districtIndex, townIndex];
				}
			},

			// 切换标签（淘宝样式）
			switchTab(index) {
				this.currentTab = index;
			},

			// 选择省份（淘宝样式）
			selectProvince(province) {
				this.currentProvince = province;
				this.currentCity = null;
				this.currentDistrict = null;
				this.currentTown = null;
				this.currentTab = 1;
				this.loadCities();
			},

			// 选择城市（淘宝样式）
			selectCity(city) {
				this.currentCity = city;
				this.currentDistrict = null;
				this.currentTown = null;
				this.currentTab = 2;
				this.loadDistricts();
			},

			// 选择区县（淘宝样式）
			selectDistrict(district) {
				this.currentDistrict = district;
				this.currentTown = null;
				if (this.level === 4) {
					this.currentTab = 3;
					this.loadTowns();
				} else {
					this.confirmSelection();
				}
			},

			// 选择乡镇（淘宝样式）
			selectTown(town) {
				this.currentTown = town;
				this.confirmSelection();
			}
		}
	};
</script>

<style scoped>
	.city-picker-container {
		position: relative;
	}

	.city-picker-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}

	.city-picker-popup.show {
		opacity: 1;
	}

	.city-picker-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0);
		transition: background-color 0.3s ease-in-out;
	}

	.city-picker-popup.show .city-picker-mask {
		background-color: rgba(0, 0, 0, 0.5);
	}

	.city-picker-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		border-top-left-radius: 16rpx;
		border-top-right-radius: 16rpx;
		overflow: hidden;
		transform: translateY(100%);
		transition: transform 0.3s ease-in-out;
	}

	.city-picker-popup.show .city-picker-content {
		transform: translateY(0);
	}

	.city-picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #e5e5e5;
	}

	.city-picker-cancel,
	.city-picker-confirm {
		font-size: 32rpx;
		color: #007aff;
	}

	.city-picker-title {
		font-size: 34rpx;
		font-weight: 500;
	}

	.city-picker-selected {
		padding: 20rpx 30rpx;
		background-color: #f9f9f9;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.selected-label {
		font-size: 28rpx;
		color: #666;
	}

	.selected-text {
		font-size: 28rpx;
		color: #333;
		margin-left: 10rpx;
	}

	.city-picker-picker {
		height: 300rpx;
	}

	.picker-item {
		height: 50rpx;
		line-height: 50rpx;
		text-align: center;
		font-size: 32rpx;
	}

	.city-picker-taobao {
		height: 500rpx;
	}

	.city-picker-tabs {
		display: flex;
		border-bottom: 1rpx solid #e5e5e5;
	}

	.city-picker-tab {
		flex: 1;
		padding: 20rpx;
		text-align: center;
		font-size: 32rpx;
		color: #666;
		position: relative;
	}

	.city-picker-tab.active {
		color: #007aff;
	}

	.city-picker-tab.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 20%;
		width: 60%;
		height: 4rpx;
		background-color: #007aff;
	}

	.city-picker-tab-content {
		height: calc(100% - 80rpx);
		overflow-y: auto;
	}

	.city-list {
		padding: 20rpx;
	}

	.city-item {
		padding: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
		font-size: 32rpx;
	}

	.city-item:last-child {
		border-bottom: none;
	}
</style>