<template>
  <modal
    id="unity-modal"
    name="unity-modal"
    :draggable="true"
    :clickToClose="false"
    :width="1200"
    :height="800"
  >
    <div>
      <button v-on:click="hide">hide</button>
      <iframe
        ref="gameInstance"
        width="100vw"
        
        scorlling="no"
        border="0"
        src="/VKBuild/index.html"
        frameborder="0"
      />

      <button v-on:click="onClickF()">Forward</button>
      <button v-on:click="onClickB()">Backward</button>
      <button v-on:click="onClickL()">TurnLeft</button>
      <button v-on:click="onClickR()">TurnRight</button>
      <button v-on:click="onClickS()">Stop</button>
      <button v-on:click="onClickImg()">Image</button>
      <button v-on:click="onClickStopStream()">Stop Stream</button>
      <p id="ImgBase64">0</p>
    </div>
  </modal>
</template>
<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import VModal from "vue-js-modal";
import Unity from "vue-unity-webgl";

export default {
  name: "Unity_view",
  components: {
    VModal,
    Unity,
  },
  computed: {},
  data() {
    return {
      intervalID: null,
    };
  },
  mounted() {
    window.addEventListener("fn", this.unityWatch);
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("fn", this.unityWatch);
    });
    /*setInterval(function () {
      console.log("Hi HI");
      document.getElementById("ImgBase64").innerHTML =
        this.$refs.gameInstance.contentWindow.ImageBase64();
    }.bind(this), 100)*/
  },
  methods: {
    hide: function () {
      clearInterval(this.intervalID);
      this.$modal.hide("unity-modal");
      
    },
    unityWatch(e) {},
    onClickF() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(0.15, 0);
    },
    onClickB() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(-0.15, 0);
    },
    onClickL() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(0, 0.4);
    },
    onClickR() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(0, -0.4);
    },
    onClickS() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(0, 0);
    },
    onClickImg() {
      this.intervalID = setInterval(
         function () {
          console.log("Hi HI");
          document.getElementById("ImgBase64").innerHTML =
            this.$refs.gameInstance.contentWindow.ImageBase64();
        }.bind(this),
        100
      );
      //document.getElementById("ImgBase64").innerHTML =
      //  this.$refs.gameInstance.contentWindow.ImageBase64();
    },
    onClickStopStream() {
      clearInterval(this.intervalID);
    },


  },
};
</script>
