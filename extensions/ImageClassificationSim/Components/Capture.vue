<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel bg-white">
        <!--- <image-display v-if="current.length" :id="current.slice(-1).pop()"></image-display> -->
        <!--<p class="view-img-desc"></p>-->

        <iframe
          ref="gameInstance"
          width="100%"
          height="90%"
          scrolling="no"
          border="0"
          src="/VKBuild/index.html"
          frameborder="0"
        />
        <div
          class="d-flex flex-fill align-items-center justify-content-center view-panel"
        >
          <!--<button v-on:click="onClickF()">Forward</button>
              <button v-on:click="onClickB()">Backward</button>
              <button v-on:click="onClickL()">TurnLeft</button>
              <button v-on:click="onClickR()">TurnRight</button>
              <button v-on:click="onClickS()">Stop</button>-->

          <b-button
            img
            v-if="isStreaming"
            v-on:click="onClickStartStream()"
            variant="danger"
            size="lg"
            >Stop stream</b-button
          >

          <b-button
            v-else
            v-on:click="onClickStartStream()"
            variant="success"
            size="lg"
            >Start stream</b-button
          >
          <dataset-counter
            :current="
              current.length ? positionOf(current.slice(-1).pop()) + 1 : null
            "
            suffix="Image"
          >
          </dataset-counter>
        </div>
        <!-- <image-dataset-list v-model="current"></image-dataset-list> -->
        <image-dataset-list
          v-model="current"
          :multiple="true"
          :showInfo="true"
        ></image-dataset-list>
      </div>
      <div class="side-panel" style="width: 300px">
        <image-capture
          source=""
          ref="camera"
          @started="(_) => (cameraReady = true)"
          @stoped="(_) => (cameraReady = false)"
        >
        </image-capture>

        <div class="center">
          <img
            v-on:click.prevent
            :class="['op-btn', { 'op-btn-disable': !cameraReady }]"
            src="~/assets/images/UI/png/Group 198.png"
            height="96"
            @click="snapAndSave"
          />
          <img
            v-b-modal.import-classify-image
            class="op-btn"
            src="~/assets/images/UI/png/Group 199.png"
            height="96"
          />
        </div>
      </div>
    </div>
    <import-images></import-images>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import ImageCapture from "~/components/InputConnection/ImageCapture.vue";
import ImageDisplay from "~/components/InputConnection/ImageDisplay.vue";
import ImageDatasetList from "~/components/InputConnection/ImageDatasetList.vue";
import DatasetCounter from "~/components/InputConnection/DatasetCounter.vue";
import ImportImages from "../Modals/ImportImages.vue";
import Unity from "vue-unity-webgl";

export default {
  name: "Capture",
  components: {
    ImageCapture,
    ImageDisplay,
    ImageDatasetList,
    DatasetCounter,
    ImportImages,
  },
  data() {
    return {
      current: [],
      cameraReady: false,
      intervalID: null,
      isStreaming: false,
    };
  },
  computed: {
    ...mapGetters("dataset", ["positionOf"]),
  },
  methods: {
    ...mapActions("dataset", ["addData"]),
    ...mapMutations(["setImageBytes"]),
    async snapAndSave() {
      if (!this.cameraReady) {
        return;
      }
      let { image, thumbnail, width, height } = await this.$refs.camera.snap();
      let data = {
        id: this.$helper.randomString(16),
        thumbnail: thumbnail,
        image: image,
        annotate: [],
        class: null,
        ext: "jpg",
      };
      let res = await this.addData(data);
      this.current = [data.id];
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
    onClickStartStream() {
      //this.$refs.gameInstance.contentWindow.VK_MovementDirec(0.15, 0);
      //for (let i = 0; i < 500000; i++) {}
      if (this.isStreaming == false) {
        this.isStreaming = true;
        this.intervalID = setInterval(
          function () {
            this.imageBytes =
              this.$refs.gameInstance.contentWindow.ImageBase64();
            this.setImageBytes(this.imageBytes);
          }.bind(this),
          50
        );
      } else {
        this.isStreaming = false;
        console.log("Stop stream");
        clearInterval(this.intervalID);
      }
    },
    onClickImg() {
      this.intervalID = setInterval(
        function () {
          this.imageBytes = this.$refs.gameInstance.contentWindow.ImageBase64();
          this.setImageBytes(this.imageBytes);
        }.bind(this)
      );
      //document.getElementById("ImgBase64").innerHTML =
      //  this.$refs.gameInstance.contentWindow.ImageBase64();
    },
    onClickStopStream() {
      console.log("Stop stream");
      clearInterval(this.intervalID);
    },
  },
};
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;
  margin: 0 0.5em;

  &:hover {
    opacity: 0.7;
  }
}

.op-btn-disable {
  pointer-events: none;
  -webkit-filter: grayscale(100%);
  /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
}

.side-panel {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 300px;

  .next {
    height: 50px;
    background: #ffffff 0% 0% no-repeat padding-box;
    border-radius: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 15px;

    span {
      color: $primary-color;
      font-size: 1.5rem;
      font-weight: 800;

      &.ico {
        position: absolute;
        top: 7px;
        right: 18px;
      }
    }
  }
}

.outer-wrap {
  overflow: hidden;
}

.main-panel {
  width: calc(100% - 300px);
}

.view-panel {
  background-color: #333;
  position: relative;

  img {
    min-width: 50%;
    min-height: 50%;
    object-fit: contain;
  }

  .view-img-desc {
    color: #fff;
  }
}
</style>
