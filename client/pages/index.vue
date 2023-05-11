<template>
  <el-container>
    <el-container>
      <el-main>
        <pre>
TestlabWebSensor

加速度(include Gravity)
  X: {{ x }}
  Y: {{ y }}
  Z: {{ z }}
傾き
  alpha: {{ alpha }}
  beta: {{ beta }}
  gamma: {{ gamma }}
Container
  type: {{ c_slice(0, 2) }}
  length: {{ c_slice(2, 4) }}
  data-index: {{ c_slice(4, 5) }}
  data-id: {{ c_slice(5, 21) }}
  payload(dt): {{ c_slice(21, 29) }}
  payload(x): {{ c_slice(25, 37) }}
  payload(y): {{ c_slice(37, 45) }}
  payload(z): {{ c_slice(45, 53) }}
  payload(α): {{ c_slice(53, 61) }}
  payload(β): {{ c_slice(61, 69) }}
  payload(γ): {{ c_slice(69, 77) }}
  <!-- {{ register_payload_text }} -->
        </pre>
        <el-select v-model="throttle_milisec" placeholder="Select">
          <el-option
            v-for="item in [
              0,
              10,
              50,
              100,
              200,
              500,
              1000,
              3000,
              10000,
              300000
            ]"
            :key="item"
            :label="item + ' msec'"
            :value="item"
          >
          </el-option>
        </el-select>
        <el-checkbox
          v-model="isRegister"
          @click="isRegister = !isRegister"
          border
          >定期送信</el-checkbox
        >
        <el-select v-model="data_type" placeholder="Select">
          <el-option
            v-for="item in ['json', 'container', 'json&container']"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>

        <el-button type="primary" @click="request_permission"
          >モーションの許可</el-button
        >
        <el-button @click="health">疎通チェック</el-button>
        <el-button @click="post_data">単発送信</el-button>
        <el-button @click="set_random">値の更新</el-button>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from "axios";
import _ from "lodash";
export default {
  data() {
    return {
      // Orientation
      alpha: 0.1,
      beta: 0.2,
      gamma: 0.3,
      // acceleration
      x: 0.01,
      y: 0.02,
      z: 0.03,
      // apikey
      isRegister: false,
      // throttle
      throttle_milisec: 1000,
      access_token: "undef",
      data_type: "container",
      motionEventLister: null,
      orientationEventLister: null
    };
  },
  async fetch() {
    // const params = new URLSearchParams();
    // params.append('grant_type', 'password')
    // params.append('username', process.env.NUXT_ENV_ORION_USERNAME)
    // params.append('password', process.env.NUXT_ENV_ORION_PASSWORD)
    // const oauth2_token = process.env.NUXT_ENV_ORION_OAUTH2_TOKEN
    // const oauth2_token_base64 = Buffer.from(oauth2_token).toString('base64')
    // const response = await fetch(`${this.orion_url}/idm/oauth2/token`, {
    //   method: "POST",
    //   body: params,
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //     "Accept": "application/json",
    //     "Authorization": `Basic ${oauth2_token_base64}`
    //   }
    // })
    // const {access_token} = await response.json()
    // this.access_token = access_token
  },
  fetchOnServer: true,
  computed: {
    url_base: function() {
      return "/api";
    },
    c_topic: function() {
      return "mb_ctopic";
    },
    j_topic: function() {
      return "mb_jtopic";
    },
    // token: async function(){
    //   return access_token
    // },
    register_payload_text: function() {
      return [...new Uint8Array(this.register_payload_binary())]
        .map(e => e.toString(16))
        .join(" ");
    }
  },
  watch: {
    throttle_milisec: function() {
      this.update_motion_listeners();
      this.update_orientation_listeners();
    },
    isRegister: function() {
      if (this.isRegister) setTimeout(this.polling, this.throttle_milisec);
    }
  },
  mounted() {
    this.update_motion_listeners(this.throttle_milisec);
    this.update_orientation_listeners(this.throttle_milisec);
    this.apikey = this.$route.query.key;
  },
  destroyed() {
    window.removeEventListener("devicemotion", this.motionEventLister);
    window.removeEventListener(
      "deviceorientation",
      this.orientationEventLister
    );
  },
  methods: {
    update_motion_listeners: function() {
      // 今設定されているmotionのLisnterを破棄
      if (this.motionEventLister) {
        window.removeEventListener("devicemotion", this.motionEventLister);
      }
      // 新しいハンドラを定義し破棄のために記録
      const newListner = _.throttle(this.devicemotion, this.throttle_milisec);
      window.addEventListener("devicemotion", newListner);
      // 新しいハンドラを破棄のために記録
      this.motionEventLister = newListner;
    },
    update_orientation_listeners: function() {
      // 今設定されているorientationのLisnterを破棄
      if (this.orientationEventLister) {
        window.removeEventListener(
          "deviceorientation",
          this.orientationEventLister
        );
      }
      // 新しいハンドラを定義しEventLisnterについか
      const newListner = _.throttle(
        this.deviceOrientation,
        this.throttle_milisec
      );
      window.addEventListener("deviceorientation", newListner);
      // 新しいハンドラを破棄のために記録
      this.orientationEventLister = newListner;
    },
    register_payload_json: function() {
      const [x, y, z, alpha, beta, gamma] = [
        this.x,
        this.y,
        this.z,
        this.alpha,
        this.beta,
        this.gamma
      ];
      const dt = Date.now();
      return { dt, x, y, z, alpha, beta, gamma };
    },
    register_payload_binary: function() {
      const [x, y, z, alpha, beta, gamma] = [
        this.x,
        this.y,
        this.z,
        this.alpha,
        this.beta,
        this.gamma
      ];
      const payload = new ArrayBuffer(77);
      const dataview = new DataView(payload);
      dataview.setUint16(0, 0); // ContainerType
      dataview.setUint16(2, 77); // ContainerLength 52+16+2+2+1
      dataview.setUint8(4, 0); // DataIndex(1byte)
      dataview.setUint32(5, 0x00112233); // DataIDを4回に分けて書く
      dataview.setUint32(9, 0x44556677); // DataIDを4回に分けて書く
      dataview.setUint32(13, 0x8899aabb); // DataIDを4回に分けて書く
      dataview.setUint32(17, 0xccddeeff); // DataIDを4回に分けて書く
      dataview.setBigUint64(21, BigInt(Date.now()));
      dataview.setFloat64(29, x);
      dataview.setFloat64(37, y);
      dataview.setFloat64(45, z);
      dataview.setFloat64(53, alpha);
      dataview.setFloat64(61, beta);
      dataview.setFloat64(69, gamma);
      return payload;
    },
    polling() {
      if (!this.isRegister) return;
      this.post_data();
      setTimeout(this.polling, this.throttle_milisec);
    },
    throttled: function(func, throttle) {
      return _.throttle(func, throttle);
    },
    request_permission: function() {
      this.permission = true;
      if (typeof DeviceMotionEvent?.requestPermission === "function") {
        DeviceMotionEvent.requestPermission();
      }
      if (typeof DeviceOrientationEvent?.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission();
      }
    },
    deviceOrientation(event) {
      const { alpha, beta, gamma } = event;
      [this.alpha, this.beta, this.gamma] = [alpha, beta, gamma];
    },
    devicemotion(event) {
      const { x, y, z } = event.accelerationIncludingGravity;
      [this.x, this.y, this.z] = [x, y, z];
    },
    set_random() {
      this.alpha = _.random(0, 360, true);
      this.beta = _.random(-180, 180, true);
      this.gamma = _.random(-90, 90, true);
      this.x = _.random(-10, 10, true);
      this.y = _.random(-10, 10, true);
      this.z = _.random(-10, 10, true);
    },
    c_slice: function(start, end) {
      return [...new Uint8Array(this.register_payload_binary())]
        .slice(start, end)
        .map(e => e.toString(16).padStart(2, "0"))
        .join(" ");
    },
    post_json_data: async function() {
      const url = `${this.url_base}/${this.j_topic}/json`;
      const { status, data } = await axios.post(
        url,
        this.register_payload_json()
      );
      if (status != 200) {
        this.$message({
          type: "error",
          message: new Date().toISOString(),
          duration: this.throttle_milisec / 2
        });
      } else {
        this.$message({
          message: JSON.stringify(data, null, 4),
          duration: this.throttle_milisec / 2
        });
      }
    },
    post_binary_data: async function() {
      const url = `${this.url_base}/${this.c_topic}/container`;
      const { status, data } = await axios.post(
        url,
        this.register_payload_binary()
      );
      if (status != 200) {
        this.$message({
          type: "error",
          message: new Date().toISOString(),
          duration: this.throttle_milisec / 2
        });
      } else {
        this.$message({
          message: JSON.stringify(data, null, 4),
          duration: this.throttle_milisec / 2
        });
      }
    },
    post_data: function() {
      if (this.data_type.includes("container")) {
        this.post_binary_data();
      }
      if (this.data_type.includes("json")) {
        this.post_json_data();
      }
    },
    health: async function() {
      const { status } = await axios.get(`/api/health`);
      if (status == 200) {
        this.$message({
          message: "ping success",
          duration: 5000
        });
      } else {
        this.$message({
          type: "error",
          message: "ping failed",
          duration: 5000
        });
      }
    }
  }
};
</script>

<style></style>
