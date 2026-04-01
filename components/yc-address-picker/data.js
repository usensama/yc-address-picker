// 数据获取模块

// 缓存数据
const cache = {
  provinces: null,
  cities: {},
  districts: {},
  towns: {}
};

// 导入数据文件
import pcaData from './pca-code.json';
import pcasData from './pcas-code.json';

// 处理数据格式，转换为易于使用的结构
const processedData = {
  pca: {
    provinces: [],
    cities: {},
    districts: {}
  },
  pcas: {
    provinces: [],
    cities: {},
    districts: {},
    towns: {}
  }
};

// 处理三级联动数据
function processPcaData() {
  pcaData.forEach(province => {
    const provinceCode = province.code.padEnd(6, '0');
    processedData.pca.provinces.push({ code: provinceCode, name: province.name });
    processedData.pca.cities[provinceCode] = [];
    
    province.children.forEach(city => {
      const cityCode = city.code.padEnd(6, '0');
      processedData.pca.cities[provinceCode].push({ code: cityCode, name: city.name });
      processedData.pca.districts[cityCode] = [];
      
      city.children.forEach(district => {
        const districtCode = district.code.padEnd(6, '0');
        processedData.pca.districts[cityCode].push({ code: districtCode, name: district.name });
      });
    });
  });
}

// 处理四级联动数据
function processPcasData() {
  pcasData.forEach(province => {
    const provinceCode = province.code.padEnd(6, '0');
    processedData.pcas.provinces.push({ code: provinceCode, name: province.name });
    processedData.pcas.cities[provinceCode] = [];
    
    province.children.forEach(city => {
      const cityCode = city.code.padEnd(6, '0');
      processedData.pcas.cities[provinceCode].push({ code: cityCode, name: city.name });
      processedData.pcas.districts[cityCode] = [];
      
      city.children.forEach(district => {
        const districtCode = district.code.padEnd(6, '0');
        processedData.pcas.districts[cityCode].push({ code: districtCode, name: district.name });
        processedData.pcas.towns[districtCode] = [];
        
        // 确保district.children存在且是数组
        if (Array.isArray(district.children) && district.children.length > 0) {
          district.children.forEach(town => {
            // 确保town对象存在且有code和name属性
            if (town && town.code && town.name) {
              const townCode = town.code.padEnd(9, '0');
              processedData.pcas.towns[districtCode].push({ code: townCode, name: town.name });
            }
          });
        }
      });
    });
  });
}

// 初始化处理数据
processPcaData();
processPcasData();

// 获取省份数据
export async function getProvinces(level = 3) {
  if (cache.provinces) {
    return cache.provinces;
  }
  
  const provinces = level === 3 ? processedData.pca.provinces : processedData.pcas.provinces;
  cache.provinces = provinces;
  return provinces;
}

// 获取城市数据
export async function getCities(provinceCode, level = 3) {
  if (cache.cities[provinceCode]) {
    return cache.cities[provinceCode];
  }
  
  const cities = level === 3 ? (processedData.pca.cities[provinceCode] || []) : (processedData.pcas.cities[provinceCode] || []);
  cache.cities[provinceCode] = cities;
  return cities;
}

// 获取区县数据
export async function getDistricts(cityCode, level = 3) {
  if (cache.districts[cityCode]) {
    return cache.districts[cityCode];
  }
  
  const districts = level === 3 ? (processedData.pca.districts[cityCode] || []) : (processedData.pcas.districts[cityCode] || []);
  cache.districts[cityCode] = districts;
  return districts;
}

// 获取乡镇数据
export async function getTowns(districtCode) {
  if (cache.towns[districtCode]) {
    return cache.towns[districtCode];
  }
  
  const towns = processedData.pcas.towns[districtCode] || [];
  cache.towns[districtCode] = towns;
  return towns;
}



// 清除缓存
export function clearCache() {
  cache.provinces = null;
  cache.cities = {};
  cache.districts = {};
  cache.towns = {};
}