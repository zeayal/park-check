<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div :id="mapContainerId" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { nanoid } from "nanoid";

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

// 生成唯一容器ID，确保每次打开都是新容器
const mapContainerId = ref(`map-${nanoid(8)}`);

// 地图实例和标记点实例
const map = ref(null);
const marker = ref(null);
const infoWindow = ref(null);

// 腾讯地图API密钥
const MAP_KEY = "BTGBZ-GOKK7-HZFXI-PF24R-77MPV-QQF6B";

// 组件挂载时初始化地图
onMounted(() => {
  const timer = setTimeout(initMap, 100);
  onUnmounted(() => clearTimeout(timer));
});

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    // 销毁地图实例（关键：腾讯地图的 destroy 方法会清理内部资源）
    map.value.destroy();
    map.value = null; // 重置为 null，避免残留引用
  }
  if (marker.value) {
    marker.value.destroy(); // 销毁标记点实例
    marker.value = null;
  }
  // 可选：清除地图容器内容（避免残留 DOM 影响下次渲染）
  const mapContainer = document.getElementById(mapContainerId.value);
  if (mapContainer) {
    mapContainer.innerHTML = "";
  }
});

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
    // 检查脚本是否已加载或正在加载
    const existingScript = document.querySelector(
      `script[src*="map.qq.com/api/gljs"]`
    );
    if (existingScript) {
      // 若已加载，直接等待 window.TMap 可用
      if (window.TMap) {
        resolve();
      } else {
        // 监听脚本加载完成事件（处理异步加载中的情况）
        const checkTMap = () => {
          if (window.TMap) {
            resolve();
          } else {
            setTimeout(checkTMap, 50);
          }
        };
        checkTMap();
      }
      return;
    }

    // 首次加载脚本
    const script = document.createElement("script");
    script.src = `https://map.qq.com/api/gljs?v=2.0&key=${MAP_KEY}`;
    script.charset = "utf-8";
    script.onload = () => {
      if (window.TMap) {
        resolve();
      } else {
        reject(new Error("地图脚本加载失败：TMap 未定义"));
      }
    };
    script.onerror = () => reject(new Error("地图脚本加载失败"));
    document.head.appendChild(script);
  });
};

// 创建地图实例和标记点
const createMap = () => {
  // 校验经纬度是否有效（避免 NaN 或非数字）
  if (isNaN(props.latitude) || isNaN(props.longitude)) {
    console.error("无效的经纬度参数", props.latitude, props.longitude);
    return; // 终止初始化，避免后续报错
  }

  // 创建地图实例
  const center = new window.TMap.LatLng(props.latitude, props.longitude);

  // 初始化地图（显式指定地图容器，避免容器未渲染的问题）
  const mapContainer = document.getElementById(mapContainerId.value);
  if (!mapContainer) {
    console.error("地图容器不存在");
    return;
  }

  map.value = new window.TMap.Map(mapContainerId.value, {
    center: center,
    zoom: 15, // 缩放级别
    pitch: 0, // 俯仰角
    rotation: 0, // 旋转角
  });

  // 创建标记点
  marker.value = new window.TMap.MultiMarker({
    map: map.value,
    styles: {
      default: new window.TMap.MarkerStyle({
        width: 40,
        height: 40,
        anchor: { x: 20, y: 40 },
        src: "/icon-esc-yc-caozuodidian.svg",
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
  infoWindow.value = new window.TMap.InfoWindow({
    map: map.value,
    position: center, //设置信息框位置
    content: props.content, //设置信息框内容
    offset: { x: 0, y: -32 },
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
</script>

<style scoped>
.map-container {
  width: 100%;
  /* 使用变量接收父组件传入的高度 */
  /* height: v-bind(mapHeight); */
  height: 100%;
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
