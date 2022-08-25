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
      <b-avatar
        icon="arrow-left-circle-fill"
        :size="52"
        button
        class="mx-1"
      ></b-avatar>
      <b-avatar
        icon="arrow-up-circle-fill"
        :size="52"
        button
        class="mx-1"
      ></b-avatar>
      <b-avatar
        icon="arrow-down-circle-fill"
        :size="52"
        button
        class="mx-1"
      ></b-avatar>
      <b-avatar
        icon="arrow-right-circle-fill"
        :size="52"
        button
        class="mx-1"
      ></b-avatar>
      <b-avatar
        icon="stop-circle-fill"
        :size="52"
        button
        class="mx-1"
      ></b-avatar>
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
    };
  },
  created() {},
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
  },
  methods: {
    async snap() {
      let image = await this.captureWithTumbnail();
      return image;
    },
    async captureWithTumbnail(thumbnail_height = 120) {
      let res = this.$refs.gameInstance.contentWindow.ImageBase64();
      res = "data:image/jpeg;base64," + res;
      let b = await fetch(res);
      let image = await b.blob();
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