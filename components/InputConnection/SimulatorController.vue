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
    <div class="game-controller">
      <!-- <b-avatar
        @click="(isStreaming = !isStreaming), $emit('onStreaming', isStreaming)"
        :icon="isStreaming ? 'stop-circle-fill' : 'play-circle-fill'"
        :size="52"
        button
        class="mx-1"
      ></b-avatar> -->
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
  props: {},
  data() {
    return {
      isStreaming: false,
    };
  },
  created() {},
  mounted() {
    this.$refs.gameInstance.contentWindow.addEventListener(
      "keyup",
      this.onKey.bind(this)
    );
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