<template>
	<view class="city-picker-container" :style="{ '--active-color': activeColor }">
		<!-- 自定义弹窗 -->
		<view v-if="value || modelValue" class="city-picker-popup" :class="{ 'show': showAnimation }" @touchmove.stop>
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
							<!-- 热门城市 -->
							<view v-if="hotCityItems.length > 0" class="hot-cities-section">
								<view class="hot-cities-title">热门城市</view>
								<view class="hot-cities-grid">
									<view v-for="(hotCity, index) in hotCityItems" :key="index" class="hot-city-item">
										<view @click="selectHotCity(hotCity)">{{ hotCity.name }}</view>
									</view>
								</view>
							</view>

							<!-- 省份列表 -->
							<view class="provinces-list">
								<view v-for="(province, index) in provinces" :key="province.code" class="city-item"
									:style="{ color: currentProvince && currentProvince.code === province.code ? activeColor : '' }"
									@click="selectProvince(province)">
									{{ province.name }}
								</view>
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
			default: () => (null)
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
		},
		// 热门城市数组，默认是国内一二线城市
		hotCities: {
			type: Array,
			default: () => ['北京市', '上海市', '深圳市', '广州市', '杭州市', '成都市', '武汉市', '重庆市', '郑州市', '天津市', '青岛市', '厦门市']
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
			showAnimation: false,
			hotCityItems: []
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
		},
		value(newValue) {
			if (newValue) {
				// 当value变为true时，先渲染元素，然后触发动画
				this.$nextTick(() => {
					this.showAnimation = true;
				});
			} else {
				// 当value变为false时，先触发动画，然后隐藏元素
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
	mounted() {
		this.loadData();
		this.getScreenHeight();
		// 处理热门城市
		this.processHotCities();
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
				if (this.provinces.length > 0) {
					if (!this.currentProvince && !this.selectedValue?.province) {
						// Picker模式下，自动加载城市数据
						if (this.mode === 'picker') {
							this.currentProvince = this.provinces[0];
							await this.loadCities();
						}
					} else {
						// 执行初始化值
						this.initValue();
					}
				} else {
					// 执行初始化值
					this.initValue();
				}
			} catch (error) {
				console.error('加载省份数据失败:', error);
				// 即使加载失败也执行初始化值
				this.initValue();
			}
		},
		// 初始化值
		initValue() {
			if (this.selectedValue) {
				// 处理 province
				if (this.selectedValue.province) {
					if (typeof this.selectedValue.province === 'string') {
						// 查找匹配的省份
						const province = this.provinces.find(p => p.name === this.selectedValue.province);
						if (province) {
							this.currentProvince = province;

							// Picker模式下，自动加载城市数据
							if (this.mode === 'picker') {
								this.loadCities();
							}
						}
					} else {
						this.currentProvince = this.selectedValue.province;

						// Picker模式下，自动加载城市数据
						if (this.mode === 'picker') {
							this.loadCities();
						}
					}
				}

				// 处理 city
				if (this.selectedValue.city) {
					if (typeof this.selectedValue.city === 'string') {
						// 查找匹配的城市
						if (this.currentProvince) {
							this.loadCities().then(() => {
								const city = this.cities.find(c => c.name === this.selectedValue.city);
								if (city) {
									this.currentCity = city;

									// 处理 district 或 area
									if (this.selectedValue.district || this.selectedValue.area) {
										const districtName = this.selectedValue.district || this.selectedValue
											.area;
										if (typeof districtName === 'string') {
											this.loadDistricts().then(() => {
												const district = this.districts.find(d => d.name ===
													districtName);
												if (district) {
													this.currentDistrict = district;

													// 处理 town，判断是否是四级联动
													if (this.level === 4 && this.selectedValue.town) {
														if (typeof this.selectedValue.town ===
															'string') {
															this.loadTowns().then(() => {
																const town = this.towns.find(
																	t => t.name === this
																		.selectedValue.town);
																if (town) {
																	this.currentTown = town;
																}

																// 淘宝模式下，设置 currentTab 为有值的最后一项
																if (this.mode === 'taobao') {
																	this.currentTab = 3;
																}
															});
														} else {
															this.currentTown = this.selectedValue.town;

															// 淘宝模式下，设置 currentTab 为有值的最后一项
															if (this.mode === 'taobao') {
																this.currentTab = 3;
															}
														}
													}
												} else {
													// 淘宝模式下，设置 currentTab 为有值的最后一项
													if (this.mode === 'taobao') {
														this.currentTab = 2;
													}
												}
											});
										} else {
											this.currentDistrict = this.selectedValue.district || this
												.selectedValue.area;

											// 处理 town，判断是否是四级联动
											if (this.level === 4 && this.selectedValue.town) {
												if (typeof this.selectedValue.town === 'string') {
													this.loadTowns().then(() => {
														const town = this.towns.find(t => t.name ===
															this.selectedValue.town);
														if (town) {
															this.currentTown = town;
														}

														// 淘宝模式下，设置 currentTab 为有值的最后一项
														if (this.mode === 'taobao') {
															this.currentTab = 3;
														}
													});
												} else {
													this.currentTown = this.selectedValue.town;

													// 淘宝模式下，设置 currentTab 为有值的最后一项
													if (this.mode === 'taobao') {
														this.currentTab = 3;
													}
												}
											} else {
												// 淘宝模式下，设置 currentTab 为有值的最后一项
												if (this.mode === 'taobao') {
													this.currentTab = 2;
												}
											}
										}
									}
								}
								else {
									// 淘宝模式下，设置 currentTab 为有值的最后一项
									if (this.mode === 'taobao') {
										this.currentTab = 1;
									}
								}
							});
						} else {
							// 淘宝模式下，设置 currentTab 为有值的最后一项
							if (this.mode === 'taobao') {
								this.currentTab = 0;
							}
						}
					} else {
						this.currentCity = this.selectedValue.city;

						// Picker模式下，自动加载区县数据
						if (this.mode === 'picker') {
							this.loadDistricts();
						}

						// 处理 district 或 area
						if (this.selectedValue.district || this.selectedValue.area) {
							this.currentDistrict = this.selectedValue.district || this.selectedValue.area;

							// Picker模式下，自动加载乡镇数据（如果是四级联动）
							if (this.mode === 'picker' && this.level === 4) {
								this.loadTowns();
							}

							// 处理 town，判断是否是四级联动
							if (this.level === 4 && this.selectedValue.town) {
								this.currentTown = this.selectedValue.town;

								// 淘宝模式下，设置 currentTab 为有值的最后一项
								if (this.mode === 'taobao') {
									this.currentTab = 3;
								}
							} else {
								// 淘宝模式下，设置 currentTab 为有值的最后一项
								if (this.mode === 'taobao') {
									this.currentTab = 2;
								}
							}
						} else {
							// 淘宝模式下，设置 currentTab 为有值的最后一项
							if (this.mode === 'taobao') {
								this.currentTab = 1;
							}
						}
					}
				} else {
					// 淘宝模式下，设置 currentTab 为有值的最后一项
					if (this.mode === 'taobao' && this.currentProvince) {
						this.currentTab = 0;
					}
				}
			} else {
				// 没有 selectedValue 时，在 Picker 模式下确保数据已加载
				if (this.mode === 'picker' && this.provinces.length > 0 && !this.currentProvince) {
					this.currentProvince = this.provinces[0];
					this.loadCities();
				}
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
			// 先触发动画
			this.showAnimation = false;
			// 动画结束后触发事件
			setTimeout(() => {
				// 触发Vue 2的v-model事件
				this.$emit('input', false);
				// 触发Vue 3的v-model事件
				this.$emit('update:modelValue', false);
			}, 300);
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
					// 自动选择第一个城市
					this.currentCity = this.cities[0];
					this.loadDistricts().then(() => {
						// 自动选择第一个区县
						this.currentDistrict = this.districts[0];
						if (this.level === 4) {
							this.loadTowns().then(() => {
								// 自动选择第一个乡镇
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

			// 加载城市数据
			this.loadCities().then(() => {
				// 检查是否是直辖市（城市列表只有一个且名称与省份相同）
				if (this.cities.length === 1 && this.cities[0].name === province.name) {
					// 自动将直辖市设置为城市
					this.currentCity = this.cities[0];
					this.currentTab = 2;
					this.loadDistricts();
				} else {
					this.currentTab = 1;
				}
			});
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
		},

		// 处理热门城市
		async processHotCities() {
			if (!this.hotCities || this.hotCities.length === 0) return;

			// 确保省份数据已加载
			if (this.provinces.length === 0) {
				await this.loadData();
			}

			// 匹配热门城市对应的省份和城市
			const hotCityItems = [];
			for (const cityName of this.hotCities) {
				let found = false;

				// 首先检查是否是直辖市（省份名称与城市名称相同）
				const province = this.provinces.find(p => p.name.includes(cityName));
				if (province) {
					hotCityItems.push({
						name: cityName,
						province: province,
					});
					found = true;
				}

				// 如果不是直辖市，遍历所有省份查找匹配的城市
				if (!found) {
					for (const province of this.provinces) {
						// 加载该省份的城市
						const provinceCities = await getCities(province.code, this.level);
						// 查找匹配的城市(名称包含即可)
						const city = provinceCities.find(c => c.name.includes(cityName));
						if (city) {
							hotCityItems.push({
								name: cityName,
								province: province,
								city: city
							});
							found = true;
							break;
						}
					}
				}
			}

			this.hotCityItems = hotCityItems;
		},

		// 选择热门城市
		selectHotCity(hotCity) {
			// 处理直辖市
			if (!hotCity.city) {
				this.currentProvince = hotCity.province;
				this.currentDistrict = null;
				this.currentTown = null;
				this.currentTab = 1;
				this.loadCities();
				return;
			}
			this.currentProvince = hotCity.province;
			this.currentCity = hotCity.city;
			this.currentDistrict = null;
			this.currentTown = null;
			this.currentTab = 2;
			this.loadDistricts();
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
	color: var(--active-color);
}

.city-picker-tab.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 20%;
	width: 60%;
	height: 4rpx;
	background-color: var(--active-color);
}

.city-picker-tab-content {
	height: calc(100% - 80rpx);
	overflow-y: auto;
}

.city-list {
	padding: 20rpx;
}

.hot-cities-section {
	margin-bottom: 30rpx;
}

.hot-cities-title {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 15rpx;
	padding-left: 10rpx;
}

.hot-cities-grid {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -10rpx;
}

.hot-city-item {
	flex: 0 0 25%;
	padding: 15rpx 10rpx;
	box-sizing: border-box;
}

.hot-city-item>view {
	text-align: center;
	padding: 15rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
}

.hot-city-item>view:active {
	background-color: #e5e5e5;
}

.provinces-list {
	margin-top: 20rpx;
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