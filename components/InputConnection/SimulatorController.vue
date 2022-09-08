<template>
  <div class="game-container">
    <iframe
      ref="gameInstance"
      width="100%"
      height="100%"
      scorlling="no"
      border="0"
      src="/VKBuild/index.html"
      frameborder="0"
    />
    <div v-if="classify" class="display-controller">
      <div class="classify-result">{{ classify }}</div>
    </div>
    <div v-if="showController" class="game-controller">
      <b-avatar
        icon="x-circle-fill"
        :size="52"
        button
        class="ml-4"
        @click="$emit('close')"
      ></b-avatar>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
export default {
  props: {
    showController: {
      type: Boolean,
      default: true,
    },
    captureKey: {
      type: Boolean,
      default: true,
    },
    classify: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isStreaming: false,
    };
  },
  created() {},
  mounted() {
    if (this.captureKey) {
      this.$refs.gameInstance.contentWindow.addEventListener(
        "keyup",
        this.onKey.bind(this)
      );
    }
  },
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
  },
  methods: {
    onKey(e) {
      if (e.key == "f") {
        this.$emit("snap");
      }
    },
    base64toBlob(base64Data, contentType = "image/jpeg") {
      contentType = contentType || "";
      var sliceSize = 1024;
      var byteCharacters = atob(base64Data);
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);

      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
          bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
      }
      return new Blob(byteArrays, { type: contentType });
    },
    getImageBase64() {
      return this.$refs.gameInstance.contentWindow.ImageBase64();
    },
    async snap() {
      let image = await this.captureWithTumbnail();
      return image;
    },
    async captureWithTumbnail(thumbnail_height = 120) {
      let res = this.$refs.gameInstance.contentWindow.ImageBase64();
      //res = "data:image/jpeg;base64," + res;
      //let b = await fetch(res);
      //let image = await b.blob();
      let image = this.base64toBlob(res);
      return {
        image: image,
        thumbnail: image,
        width: 320,
        height: 240,
      };
    },
  },
};
</script>
<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.display-controller {
  position: absolute;
  width: 100%;
  border: solid green 1px;
  top: 50%;
  aspect-ratio: 16 / 9;
  transform: translateY(-50%);
}
.classify-result {
  width: 100%;
  bottom: 0;
  position: absolute;
  text-align: center;
  color: white;
  background-color: #00000057;
}
.game-controller {
  position: absolute;
  bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>