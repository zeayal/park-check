<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 接收父组件传入的经纬度
const props = defineProps({
  latitude: {
    type: Number,
    required: true,
    default: 39.98412,
  },
  longitude: {
    type: Number,
    required: true,
    default: 116.307484,
  },
  content: {
    type: String,
  },
});

// 地图实例和标记点实例
const map = ref(null);
const marker = ref(null);
const infoWindow = ref(null);
const control = ref(null);

// 腾讯地图API密钥
const MAP_KEY = "BTGBZ-GOKK7-HZFXI-PF24R-77MPV-QQF6B";

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
    // 避免重复加载
    if (document.querySelector(`script[src*="map.qq.com/api/gljs"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://map.qq.com/api/gljs?v=2.0&key=${MAP_KEY}`;
    script.charset = "utf-8";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 创建地图实例和标记点
const createMap = () => {
  // 创建地图实例
  const center = new window.TMap.LatLng(props.latitude, props.longitude);
  map.value = new window.TMap.Map("map", {
    center: center,
    zoom: 15, // 缩放级别
    pitch: 0, // 俯仰角
    rotation: 0, // 旋转角
  });

  control.value = map.value.getControl(TMap.constants.DEFAULT_CONTROL_ID.ZOOM);
  control.value.setPosition(TMap.constants.CONTROL_POSITION.BOTTOM_RIGHT);

  // 移除缩放控件
  map.value.removeControl(control.value);

  // 创建标记点
  marker.value = new window.TMap.MultiMarker({
    map: map.value,
    styles: {
      default: new window.TMap.MarkerStyle({
        width: 40,
        height: 40,
        anchor: { x: 20, y: 40 },
        src: "../../src/images/icon-esc-yc-caozuodidian.svg",
      }),
    },
    geometries: [
      {
        id: "marker1",
        styleId: "default",
        position: center,
      },
    ],
  });

  //初始化infoWindow
  //   infoWindow.value = new window.TMap.InfoWindow({
  //     map: map.value,
  //     position: center, //设置信息框位置
  //     content: props.content, //设置信息框内容
  //     offset: { x: 0, y: -32 },
  //   });
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
  width: 100%;
  /* 使用变量接收父组件传入的高度 */
  height: v-bind(mapHeight);
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

/* 解决模态框显示隐藏时的地图问题 */
:deep(.map-container-hidden) {
  display: none !important;
}
</style>
