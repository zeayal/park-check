<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div id="map" class="map"></div>

    <!-- 控制区域 -->
    <div class="control-panel">
      <h3>腾讯地图示例</h3>
      <div class="input-group">
        <label>纬度：</label>
        <input v-model.number="latitude" type="number" step="0.000001" />
      </div>
      <div class="input-group">
        <label>经度：</label>
        <input v-model.number="longitude" type="number" step="0.000001" />
      </div>
      <button @click="updateMarker" class="update-btn">更新标记位置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 地图实例和标记点实例
const map = ref(null);
const marker = ref(null);

// 经纬度数据
const latitude = ref(39.98412); // 纬度
const longitude = ref(116.307484); // 经度

// 腾讯地图API密钥，请替换为你自己的密钥
const MAP_KEY = "YOUR_TENCENT_MAP_KEY";

// 初始化地图
const initMap = () => {
  // 检查是否已加载腾讯地图API
  if (window.TMap) {
    createMap();
  } else {
    // 动态加载腾讯地图API
    loadMapScript()
      .then(() => {
        createMap();
      })
      .catch((err) => {
        console.error("地图加载失败:", err);
      });
  }
};

// 动态加载地图脚本
const loadMapScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${MAP_KEY}`;
    script.charset = "utf-8";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 创建地图实例和标记点
const createMap = () => {
  // 创建地图实例
  const center = new window.TMap.LatLng(latitude.value, longitude.value);
  map.value = new window.TMap.Map("map", {
    center: center,
    zoom: 15, // 缩放级别
    pitch: 0, // 俯仰角
    rotation: 0, // 旋转角
  });

  // 创建标记点
  marker.value = new window.TMap.Marker({
    map: map.value,
    position: center,
    // 自定义标记点样式
    icon: {
      url: "https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker-default.png",
      width: 40,
      height: 40,
    },
    anchor: { x: 20, y: 40 }, // 锚点位置，对应图标底部中心点
  });
};

// 更新标记点位置
const updateMarker = () => {
  if (!marker.value || !map.value) return;

  const newPosition = new window.TMap.LatLng(latitude.value, longitude.value);
  // 更新标记位置
  marker.value.setPosition(newPosition);
  // 移动地图中心到新位置
  map.value.setCenter(newPosition);
};

// 组件挂载时初始化地图
onMounted(() => {
  initMap();
});

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    // 移除地图实例
    map.value.destroy();
  }
});
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.map {
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.input-group {
  margin: 10px 0;
}

input {
  width: 150px;
  padding: 6px;
  margin-left: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.update-btn {
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.update-btn:hover {
  background-color: #359e75;
}
</style>
