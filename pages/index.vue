<template>
  <el-container>
    <el-header>MotionRecorder</el-header>
    <el-container>
      <el-main>
        <pre>
        加速度(include Gravity)
          X: {{x}}
          Y: {{y}}
          Z: {{z}}
        傾き
          alpha: {{alpha}}
          beta: {{beta}}
          gamma: {{gamma}}
        Container
          type: {{c_slice(0, 2)}}
          length: {{c_slice(2, 4)}}
          data-index: {{c_slice(4, 5)}}
          data-id: {{c_slice(5, 21)}}
          payload(dt): {{c_slice(21, 25)}}
          payload(x): {{c_slice(25, 33)}}
          payload(y): {{c_slice(33, 41)}}
          payload(z): {{c_slice(41, 49)}}
          payload(α): {{c_slice(49, 57)}}
          payload(β): {{c_slice(57, 65)}}
          payload(γ): {{c_slice(65, 73)}}
          {{register_payload_text}}
        </pre>
        <el-checkbox v-model="isRegister" @click="isRegister=!isRegister" border>post</el-checkbox>
        <el-select v-model="throttle_milisec" placeholder="Select">
          <el-option
            v-for="item in [0, 10, 50, 100, 200, 500, 1000, 3000, 10000, 1000000000]"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>

        <el-button type="primary" @click="request_permission">モーションの許可</el-button>
        <el-button type="primary" @click="check_with_auth">疎通チェック</el-button>
        <el-button type="primary" @click="post_binary_data">コンテナポスト</el-button>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
export default {
  data(){
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
      access_token: "undef"
    }
  },
  async fetch(){
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
  computed:{
    orion_url: function(){
      return 'https://839f-124-36-47-90.ngrok.io'
//      return process.env.NUXT_ENV_ORION_ENDPOINT
    },
    // token: async function(){
    //   return access_token
    // },
    register_data: function(){
      const [x, y, z, alpha, beta, gamma] = [this.x, this.y, this.z, this.alpha, this.beta, this.gamma]
      const DateTime = new Date().toISOString()
      return {DateTime, x, y, z, alpha, beta, gamma}
    },
    register_payload_binary: function(){
      const [x, y, z, alpha, beta, gamma] = [this.x, this.y, this.z, this.alpha, this.beta, this.gamma]
      const payload = new ArrayBuffer(73)
      const dataview = new DataView(payload)
      dataview.setUint16(0, 0) // ContainerType
      dataview.setUint16(2, 73) // ContainerLength 52+16+2+2+1
      dataview.setUint8(4, 0) // DataIndex(1byte)
      dataview.setUint32(5, 0x00112233) // DataIDを4回に分けて書く
      dataview.setUint32(9, 0x44556677) // DataIDを4回に分けて書く
      dataview.setUint32(13, 0x8899aabb) // DataIDを4回に分けて書く
      dataview.setUint32(17, 0xccddeeff) // DataIDを4回に分けて書く
      dataview.setUint32(21, Number.parseInt(Date.now() / 1000))
      dataview.setFloat64(25, x)
      dataview.setFloat64(33, y)
      dataview.setFloat64(41, z)
      dataview.setFloat64(49, alpha)
      dataview.setFloat64(57, beta)
      dataview.setFloat64(65, gamma)
      return payload
    },
    register_payload_text: function(){
      return [...new Uint8Array(this.register_payload_binary)].map(e=>e.toString(16)).join(" ")
    }
  },
  watch:{
    throttle_milisec: function(newThrottle, oldThrottle){
      window.removeEventListener('deviceorientation', this.throttled(this.deviceOrientation, oldThrottle))
      window.addEventListener('deviceorientation', this.throttled(this.deviceOrientation, newThrottle))
      window.removeEventListener('devicemotion', this.throttled(this.devicemotion, oldThrottle))
      window.addEventListener('devicemotion', this.throttled(this.devicemotion, newThrottle))
    },
    register_data(){
      this.post_validation()
    }
  },
  mounted(){
    window.addEventListener('deviceorientation', this.throttled(this.deviceOrientation, this.throttle_milisec))
    window.addEventListener('devicemotion', this.throttled(this.devicemotion, this.throttle_milisec))
    this.apikey = this.$route.query.key
  },
  destroyed(){
    window.removeEventListener('deviceorientation', this.throttled(this.deviceOrientation, this.throttle_milisec))
    window.removeEventListener('devicemotion', this.throttled(this.devicemotion, this.throttle_milisec))
  },
  methods: {
    cap: function(num){
      if (num < 0){
        return 0
      }
      else if(num > 100){
        return 100
      }
      return num
    },
    throttled: function(func, throttle) {
      if(!this.memoize_thrttoled)
        this.memoize_thrttoled = _.memoize((func, throttle)=> _.throttle(func, throttle), (func, throttle)=> func.name + throttle)
      return this.memoize_thrttoled(func, throttle)
    },
    request_permission: function(){
      this.permission = true
      if (
        typeof DeviceMotionEvent?.requestPermission === 'function'
      ) {
        DeviceMotionEvent.requestPermission();
      }
      if (
        typeof DeviceOrientationEvent?.requestPermission === 'function'
      ) {
        DeviceOrientationEvent.requestPermission();
      }
    },
    deviceOrientation(event) {
      const {alpha, beta, gamma} = event;
      [this.alpha, this.beta, this.gamma] = [alpha, beta, gamma]
    },
    devicemotion(event) {
      const {x, y, z} = event.accelerationIncludingGravity;
      [this.x, this.y, this.z] = [x, y, z];
    },
    post_single_data: async function(){
      this.$message({
        message: new Date().toISOString(),
        duration: this.throttle_milisec * 2
      })
      if(this.x === undefined){
        console.log("no value")
      }
      const {status, data} = await axios.post(`${this.orion_url}/container/parse`, this.register_data)
      if(status != 200)
        this.$message({
          type: 'error',
          message: new Date().toISOString(),
          duration: 5000
        })
    },
    c_slice: function(start, end){
      return [...new Uint8Array(this.register_payload_binary)].slice(start, end).map(e=>e.toString(16).padStart(2, "0")).join(" ")
    },
    post_binary_data: async function(){
      this.$message({
        message: new Date().toISOString(),
        duration: this.throttle_milisec * 2
      })
      if(this.x === undefined){
        console.log("no value")
      }
      const url = `${this.orion_url}/container/parse`
      const {status, data} = await axios.post(url, this.register_payload_binary)
      if(status != 200){
        this.$message({
          type: 'error',
          message: new Date().toISOString(),
          duration: 5000
        })
      }
      else{
        this.$message({
          message: JSON.stringify(data, null, 4),
          duration: 5000
        })
      }
    },
    post_validation: function(){
      if(!this.isRegister)
        return
      return this.throttled(this.post_binary_data, this.throttle_milisec)()
    },
    check_with_auth: async function(){
      const {status} = await axios.get(`${this.orion_url}/health`)
      if(status == 200){
        this.$message({
          message: "ping success",
          duration: 5000
        })
      }
      else{
        this.$message({
          type: 'error',
          message: "ping failed",
          duration: 5000
        })
      }

    }
  }
}
</script>

<style>
</style>
